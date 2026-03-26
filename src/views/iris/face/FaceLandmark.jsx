import React, { useState, useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";
import { useNavigate } from 'react-router'



const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
const EAR_THRESHOLD = 0.2;
const BLINK_COOLDOWN = 400; // ms between blinks
const REQUIRED_BLINKS = 2;
const FaceLandmark = () => {
    const navigate = useNavigate()
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
                navigate(`/iris-scan-complete`)
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
        const results = faceLandmarker.detectForVideo(video, now);

        if (results.faceLandmarks?.length > 0) {
            const landmarks = results.faceLandmarks[0];
        
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
        draw(results);
        requestAnimationFrame(predict);
    };

    return (
        <div>
            <video ref={videoRef} style={{ position: "absolute" }} />
            <canvas ref={canvasRef} style={{ position: "absolute" }} />
            <div
            style={{
                position: "absolute",
                top: 10,
                left: 10,
                color: "white",
                background: isLive ? "green" : "red",
                padding: "8px"
            }}
            >
            {isLive ? "✅ Real Human" : "❌ Not Verified"}
            </div>
        </div>
      );
}

export default FaceLandmark;