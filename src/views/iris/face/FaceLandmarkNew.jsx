import React, { useState, useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";



const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
const SWITCH_INTERVAL = 12000; // 12 sec
const lerp = (start, end, t) => start + (end - start) * t;
const EAR_THRESHOLD = 0.2;
const BLINK_COOLDOWN = 400; // ms between blinks
const REQUIRED_BLINKS = 2;
const FaceLandmarkNew = ({handleRedirect}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    let faceLandmarker;
    let drawingUtils;

    // Live detection
    const blinkRef = useRef({
        lastEAR: 1,
        blinkCount: 0,
        eyeClosed: false,
        lastBlinkTime: 0
    });
    const movementRef = useRef({ moved: false, startX: null });
    const depthRef = useRef({ values: [] });
    const validTimeRef = useRef(0);
    const lastTimeRef = useRef(Date.now());

    const [isLive, setIsLive] = useState(false);
    const isLiveRef = useRef(false);
    let animationIdRef = useRef(null);
    const [isFaceRatioOk, setIsFaceRatioOk] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if(isLive) {
            const freezeTimer = setTimeout(() => {
          
                // 🛑 Stop animation loop
                if (animationIdRef.current) {
                  cancelAnimationFrame(animationIdRef.current);
                }
          
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
          
                // ✅ Match exact resolution (VERY IMPORTANT)
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
          
                // 🧊 Freeze clean frame AFTER delay
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
                // 🛑 Stop camera
                const stream = video.srcObject;
                if (stream) {
                  stream.getTracks().forEach(track => track.stop());
                }

          
            }, 200);
        
            const redirectTimer = setTimeout(() => {
                handleRedirect()
            }, 2000);

            return () => {
                clearTimeout(freezeTimer);
                clearTimeout(redirectTimer);
            };
        }
    }, [isLive])

    useEffect(() => {
    const init = async () => {
        const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        faceLandmarker = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
            baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
            },
            runningMode: "VIDEO",
            numFaces: 1
        }
        );

        drawingUtils = new DrawingUtils(canvasRef.current.getContext("2d"));

        startCamera();
    };

    init();
    }, []);

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      
        videoRef.current.srcObject = stream;
      
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
      
          // ✅ Start detection ONLY after video is ready
          requestAnimationFrame(predict);
        };
    };
    const getEyeSize = (landmarks, canvas) => {
        const p1 = landmarks[33];
        const p2 = landmarks[133];
      
        const dx = (p1.x - p2.x) * canvas.width;
        const dy = (p1.y - p2.y) * canvas.height;
      
        return Math.sqrt(dx * dx + dy * dy); // 👈 eye width in pixels
    };
    const getEyeCenters = (landmarks, canvas) => {
        const getPos = (p) => ({
          x: p.x * canvas.width,
          y: p.y * canvas.height
        });
      
        const leftCenter = getPos({
          x: (landmarks[33].x + landmarks[133].x) / 2,
          y: (landmarks[33].y + landmarks[133].y) / 2
        });
      
        const rightCenter = getPos({
          x: (landmarks[362].x + landmarks[263].x) / 2,
          y: (landmarks[362].y + landmarks[263].y) / 2
        });
      
        return { leftCenter, rightCenter };
    };
    const scanRef = useRef({
        currentEye: "left",
        lastSwitch: Date.now(),
        position: { x: 0, y: 0 }
    });
    const drawIrisScanner = (ctx, center, eyeSize) => {
        const { x, y } = center;
      
        ctx.save();
        
        const color = isLiveRef.current ? "#30FF30" : "#00eaff";

        // 🔥 glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;

        const gradient = ctx.createRadialGradient(x, y, 10, x, y, 60);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");
      
        const baseRadius = eyeSize * 0.8;
        const innerRadius = eyeSize * 0.5;

        // 🟢 main circle
        ctx.beginPath();
        ctx.arc(center.x, center.y, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      
        // 🔵 inner ring
        ctx.beginPath();
        ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      
        // 🧩 segmented arc (like your image)
        for (let i = 0; i < 12; i++) {
          const start = (i * Math.PI * 2) / 12;
          const end = start + 0.2;
      
          ctx.beginPath();
          ctx.arc(center.x, center.y, eyeSize * 0.8, start, end);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      

        ctx.restore();
    };
    let angle = 0;

    const drawScannerAnimated = (ctx, center, eyeSize) => {
    angle += 0.02;

    const outerRadius = eyeSize * 1.2;

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(angle);

    for (let i = 0; i < 10; i++) {
        const start = (i * Math.PI * 2) / 10;
        const end = start + 0.3;

        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, start, end);
        ctx.strokeStyle = "#00eaff";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
    };
    const draw = (results) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
    
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        if (results.faceLandmarks) {
            const color = isLiveRef.current ? "#30FF30" : "#FF3030";
            for (const landmarks of results.faceLandmarks) {
                const { leftCenter, rightCenter } = getEyeCenters(landmarks, canvas);

                const target =
                scanRef.current.currentEye === "left"
                    ? leftCenter
                    : rightCenter;

                // smooth follow
                scanRef.current.position.x = lerp(
                scanRef.current.position.x,
                target.x,
                0.2
                );

                scanRef.current.position.y = lerp(
                scanRef.current.position.y,
                target.y,
                0.2
                );

                const eyeSize = getEyeSize(landmarks, canvas);
                drawIrisScanner(ctx, scanRef.current.position, eyeSize);
                drawScannerAnimated(ctx, scanRef.current.position, eyeSize);
            }
        }
    };

    const getEAR = (eye) => {
        const dist = (a, b) =>
          Math.hypot(a.x - b.x, a.y - b.y);
      
        const A = dist(eye[1], eye[5]);
        const B = dist(eye[2], eye[4]);
        const C = dist(eye[0], eye[3]);
      
        return (A + B) / (2.0 * C);
    };
    let lastTime = 0;
    let lastLightCheck = 0;
    const FPS = 15; // 👈 ideal
    const predict = async () => {
        
        animationIdRef.current = requestAnimationFrame(predict);

        // 🚨 STOP everything if verified
        if (isLiveRef.current) return;

        const video = videoRef.current;

        const now = Date.now();
        if (now - scanRef.current.lastSwitch > SWITCH_INTERVAL && scanRef.current.currentEye === "left") {
            scanRef.current.currentEye = "right";
            scanRef.current.lastSwitch = now;
        }

        if (
            !video ||
            video.videoWidth === 0 ||
            video.videoHeight === 0 ||
            !faceLandmarker
        ) return;

        if (now - lastTime < 1000 / FPS) return;
        lastTime = now;

        if (!video || video.videoWidth === 0) return;

        const results = faceLandmarker.detectForVideo(video, now);

        if (results.faceLandmarks?.length > 0) {
            const landmarks = results.faceLandmarks[0];
        
            const canvas = canvasRef.current;
            const faceOk = isFaceLargeEnough(landmarks, canvas);
            setIsFaceRatioOk(faceOk)
            if (now - lastLightCheck > 1000) {
                const dark = isTooDark(video, canvas);
                setIsDark(dark);
                lastLightCheck = now;
            }

            const delta = now - lastTimeRef.current;
            lastTimeRef.current = now;

            if(faceOk){
                if(!isDark)
                    validTimeRef.current += delta;

                // 👁️ BLINK DETECTION
                const leftEye = LEFT_EYE.map(i => landmarks[i]);
                const rightEye = RIGHT_EYE.map(i => landmarks[i]);
            
                const ear = (getEAR(leftEye) + getEAR(rightEye)) / 2;

                // 👁️ detect closing
                if (ear < EAR_THRESHOLD && !blinkRef.current.eyeClosed) {
                blinkRef.current.eyeClosed = true;
                }

                // 👁️ detect opening → counts as 1 blink
                if (
                ear >= EAR_THRESHOLD &&
                blinkRef.current.eyeClosed
                ) {
                    
                    
                    // prevent double counting
                    if (now - blinkRef.current.lastBlinkTime > BLINK_COOLDOWN) {
                        blinkRef.current.blinkCount += 1;
                        blinkRef.current.lastBlinkTime = now;
                    }

                    blinkRef.current.eyeClosed = false;
                }

                blinkRef.current.lastEAR = ear;
            
                // 🎯 HEAD MOVEMENT (nose tracking)
                const nose = landmarks[1];
            
                if (movementRef.current.startX === null) {
                movementRef.current.startX = nose.x;
                }
            
                if (
                Math.abs(nose.x - movementRef.current.startX) > 0.05
                ) {
                movementRef.current.moved = true;
                }
            
                // 📏 DEPTH CHECK
                const zValues = landmarks.map(p => p.z);
                const mean =
                zValues.reduce((a, b) => a + b, 0) /
                zValues.length;
            
                const variance =
                zValues.reduce((a, b) => a + (b - mean) ** 2, 0) /
                zValues.length;
            
                depthRef.current.values.push(variance);
            
                if (depthRef.current.values.length > 10) {
                depthRef.current.values.shift();
                }
            
                const avgDepth =
                depthRef.current.values.reduce((a, b) => a + b, 0) /
                depthRef.current.values.length;
                
                // ✅ FINAL LIVENESS CHECK
                if (
                    blinkRef.current.blinkCount >= REQUIRED_BLINKS &&
                    movementRef.current.moved &&
                    avgDepth > 0.0005 &&
                    validTimeRef.current >= 25000 &&
                    !isLiveRef.current
                ) {
                    setIsLive(true);
                    isLiveRef.current = true;
                }
            }
        }
        draw(results);
        requestAnimationFrame(predict);
    };

    const isFaceLargeEnough = (landmarks, canvas) => {
        let minX = 1, minY = 1;
        let maxX = 0, maxY = 0;
      
        landmarks.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
      
        const faceWidth = (maxX - minX) * canvas.width;
        const faceHeight = (maxY - minY) * canvas.height;
      
        const faceArea = faceWidth * faceHeight;
        const canvasArea = canvas.width * canvas.height;
      
        const ratio = faceArea / canvasArea;
      
        return ratio > 0.25; // 👈 tune this
    }
    const isTooDark = (video, canvas) => {
        const ctx = canvas.getContext("2d");
      
        // draw current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
      
        let totalBrightness = 0;
      
        // sample pixels (skip some for performance)
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
      
          // brightness formula
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;
        }
      
        const avgBrightness = totalBrightness / (data.length / 40 / 4);
      
        console.log('avgBrightness:' + avgBrightness);
        return avgBrightness < 200; // 👈 threshold
    };
    return (
    <div className="p-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="sm:w-1/2 sm:order-first">
                <div className="relative w-full aspect-[4/3]"
                    style={{
                    maxWidth: "640px",
                }}>
                    <video
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-auto"
                    />

                    <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-auto"
                    />

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-lg">
                    {
                    isDark ? ("❌ Move closer to the light") :
                    !isFaceRatioOk ? ("❌ Move closer to the camera") :
                    (isLive ? "✅ Scan Complete" : "⚠️ Move your face side to side")
                    }
                    </div>
                </div>
            </div>
            <div className="sm:w-1/2 sm:order-last">
                <h2 className="text-3xl font-semibold">Instructions</h2>
                <ul className="list-disc pl-4 text-2xl">
                    <li>Look straight into the camera</li>
                    <li>Ensure good lighting on your face</li>
                    <li>Remove glasses if glare appears</li>
                    <li>Avoid backlight (bright light behind you)</li>
                    <li>Keep your face inside the frame</li>
                    <li>Move your head slightly (left/right)</li>
                    <li>Stay still for a moment</li>
                </ul>
            </div>
        </div>
    </div>
    )
}

export default FaceLandmarkNew;