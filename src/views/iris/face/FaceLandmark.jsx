import React, { useState, useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";



const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
const EAR_THRESHOLD = 0.2;
const BLINK_COOLDOWN = 400; // ms between blinks
const REQUIRED_BLINKS = 2;
const FaceLandmark = ({handleRedirect}) => {
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

    const [isLive, setIsLive] = useState(false);
    const isLiveRef = useRef(false);
    let animationIdRef = useRef(null);
    const [isFaceRatioOk, setIsFaceRatioOk] = useState(false);

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
                console.log('Redirect.......')
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

    const draw = (results) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
    
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        if (results.faceLandmarks) {
            const color = isLiveRef.current ? "#30FF30" : "#FF3030";
            for (const landmarks of results.faceLandmarks) {
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                    { color: color, lineWidth: 1.5 }
                );
                drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                    { color: color, lineWidth: 1.5 }
                );
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
    const FPS = 15; // 👈 ideal
    const predict = async () => {
        
        animationIdRef.current = requestAnimationFrame(predict);

        // 🚨 STOP everything if verified
        if (isLiveRef.current) return;

        const video = videoRef.current;

        if (
            !video ||
            video.videoWidth === 0 ||
            video.videoHeight === 0 ||
            !faceLandmarker
        ) return;

        const now = Date.now();
        if (now - lastTime < 1000 / FPS) return;
        lastTime = now;

        if (!video || video.videoWidth === 0) return;
        const results = faceLandmarker.detectForVideo(video, now);

        if (results.faceLandmarks?.length > 0) {
            const landmarks = results.faceLandmarks[0];
        
            const canvas = canvasRef.current;
            const faceOk = isFaceLargeEnough(landmarks, canvas);
            setIsFaceRatioOk(faceOk)
            if(faceOk){
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
                const now = Date.now();

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
                    avgDepth > 0.0005
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
                    !isFaceRatioOk ? ("❌ Move closer to the camera") 
                    : (isLive ? "✅ Scan Complete" : "⚠️ Move your face side to side")
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

export default FaceLandmark;