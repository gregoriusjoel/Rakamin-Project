"use client"

import React, { useEffect } from "react"

type Props = {
  open: boolean
  onClose: () => void
  imageSrc?: string
  onCapture?: (dataUrl: string) => void
}

export default function ModalCamera({ open, onClose, imageSrc, onCapture }: Props) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [localCaptured, setLocalCaptured] = React.useState<string | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0); // 0..3 (3 means ready to countdown)
  const currentStepRef = React.useRef<number>(0);
  const stableRef = React.useRef(0);
  const [handBox, setHandBox] = React.useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [mismatch, setMismatch] = React.useState(false);
  const mismatchTimerRef = React.useRef<number | null>(null);
  const lastMatchRef = React.useRef<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  
  useEffect(() => {
    if (open) {
      setLocalCaptured(null);
      setCountdown(null);
      setHandBox(null);
      setCurrentStep(0);
      currentStepRef.current = 0;
      stableRef.current = 0;
      lastMatchRef.current = null;
      setMismatch(false);
      if (mismatchTimerRef.current) { window.clearTimeout(mismatchTimerRef.current); mismatchTimerRef.current = null; }
    }
  }, [open]);

  
  useEffect(() => {
    let mounted = true;
    const start = async () => {
      if (!open) return;
      if (imageSrc) return; 
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: false });
        if (!mounted) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
  console.warn('Camera start failed', err);
      }
    };
    start();
    return () => { mounted = false; };
  }, [open, imageSrc]);

  
  useEffect(() => {
    if (!open) return;
    if (!videoRef.current) return;
    let hands: any = null;
    let camera: any = null;
    let cancelled = false;

    const resetSequence = () => {
      stableRef.current = 0;
      lastMatchRef.current = null;
      setCurrentStep(0);
      setHandBox(null);
      setCountdown(null);
      setMismatch(false);
      if (mismatchTimerRef.current) { window.clearTimeout(mismatchTimerRef.current); mismatchTimerRef.current = null; }
    };

    const startHands = async () => {
      try {
        
        const HandsMod = await import('@mediapipe/hands');
  const CameraMod = await import('@mediapipe/camera_utils');

        
        hands = new HandsMod.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (cancelled) return;
          
          if (localCaptured || imageSrc) return;
          if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            
            stableRef.current = 0;
            lastMatchRef.current = null;
            setHandBox(null);
            
            setMismatch(false);
            if (mismatchTimerRef.current) { window.clearTimeout(mismatchTimerRef.current); mismatchTimerRef.current = null; }
            return;
          }

          const landmarks = results.multiHandLandmarks[0];
          
          const v = videoRef.current!;
          const vw = v.videoWidth || 640;
          const vh = v.videoHeight || 480;
          const xs = landmarks.map((lm: any) => lm.x * (vw || 640));
          const ys = landmarks.map((lm: any) => lm.y * (vh || 480));
          const minX = Math.max(0, Math.min(...xs));
          const maxX = Math.min(vw, Math.max(...xs));
          const minY = Math.max(0, Math.min(...ys));
          const maxY = Math.min(vh, Math.max(...ys));
          
          const dispW = v.clientWidth || vw;
          const dispH = v.clientHeight || vh;
          const scaleX = dispW / (vw || dispW);
          const scaleY = dispH / (vh || dispH);
          const left = minX * scaleX;
          const top = minY * scaleY;
          const width = Math.max(40, (maxX - minX) * scaleX);
          const height = Math.max(40, (maxY - minY) * scaleY);
          setHandBox({ left, top, width, height });

          
          let extended = 0;
          const tips = [8, 12, 16, 20];
          const pips = [6, 10, 14, 18];
          for (let i = 0; i < tips.length; i++) {
            const tip = landmarks[tips[i]];
            const pip = landmarks[pips[i]];
            if (!tip || !pip) continue;
            
            if (tip.y < pip.y - 0.02) extended++;
          }

          
          let matched = false;
          const cs = currentStepRef.current;
          const target = cs === 0 ? 3 : cs === 1 ? 2 : cs === 2 ? 1 : null;
          
          if (target !== null) matched = extended === target;

          const now = Date.now();
          if (matched) {
            if (lastMatchRef.current === null) {
              lastMatchRef.current = now;
              stableRef.current = 1;
            } else {
              stableRef.current += 1;
            }
            
            if (now - (lastMatchRef.current || 0) > 600) {
              setCurrentStep((s) => {
                const next = s + 1;
                currentStepRef.current = next;
                lastMatchRef.current = null;
                stableRef.current = 0;
                setMismatch(false);
                if (mismatchTimerRef.current) { window.clearTimeout(mismatchTimerRef.current); mismatchTimerRef.current = null; }
                return next;
              });
            }
          } else {
            
            lastMatchRef.current = null;
            stableRef.current = 0;
            
            if (mismatchTimerRef.current) window.clearTimeout(mismatchTimerRef.current);
            mismatchTimerRef.current = window.setTimeout(() => {
              setMismatch(true);
              mismatchTimerRef.current = null;
            }, 250);
          }
          
        });

        
        camera = new CameraMod.Camera(videoRef.current!, {
          onFrame: async () => {
            if (videoRef.current) await hands.send({ image: videoRef.current });
          },
          width: 1280,
          height: 720,
        });
        camera.start();
      } catch (err) {
        console.warn('Failed to initialize MediaPipe Hands', err);
      }
    };

    startHands();

    return () => {
      cancelled = true;
      try {
        if (hands && hands.close) hands.close();
      } catch (e) {}
      try {
        if (camera && camera.stop) camera.stop();
      } catch (e) {}
      if (mismatchTimerRef.current) { window.clearTimeout(mismatchTimerRef.current); mismatchTimerRef.current = null; }
    };
  
  }, [open, imageSrc, localCaptured]);

  
  useEffect(() => {
    if (currentStep >= 3 && countdown === null) setCountdown(3);
  }, [currentStep]);

  
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      
      
      const dataUrl = captureToLocal();
      if (dataUrl) {
        
        try { stopStream(); } catch (e) {}
        
        setHandBox(null);
        setMismatch(false);
      }
      
      setCountdown(null);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (!open && stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  }, [open, stream]);

  if (!open) return null;

  const captureToLocal = (): string | null => {
    try {
      const video = videoRef.current;
      if (!video) return null;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setLocalCaptured(dataUrl);
      try { stopStream(); } catch (e) {}
      return dataUrl;
    } catch (err) {
      console.error('capture failed', err);
      return null;
    }
  };

  const handleUse = () => {
    if (localCaptured && onCapture) onCapture(localCaptured);
    onClose();
  };

  const handleRetake = () => {
    setLocalCaptured(null);
    setCurrentStep(0);
    currentStepRef.current = 0;
    stableRef.current = 0;
    lastMatchRef.current = null;
    setMismatch(false);
    if (mismatchTimerRef.current) { window.clearTimeout(mismatchTimerRef.current); mismatchTimerRef.current = null; }
    setHandBox(null);

    (async () => {
      try {
        if (videoRef.current && !videoRef.current.srcObject) {
          const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: false });
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        } else if (videoRef.current && videoRef.current.srcObject) {
          setTimeout(() => { }, 50);
        }
      } catch (err) {
        console.warn('Failed to restart camera on retake', err);
      }
    })();
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
        
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        
        <div className="mb-4 flex items-start justify-between">
          <div className="pr-8">
            <h2 className="text-2xl font-semibold text-gray-900">Raise Your Hand to Capture</h2>
            <p className="mt-2 text-sm text-gray-600">We'll take the photo once your hand pose is detected.</p>
          </div>
        </div>

        
        <div className="mx-auto mb-6 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <div className="relative h-80 w-full bg-gray-200 md:h-96">
            {imageSrc || localCaptured ? (
              <img src={imageSrc || localCaptured || ''} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover bg-black" />
              </div>
            )}

            
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            
            {handBox && !(imageSrc || localCaptured) ? (
              <div>
                
                <div
                  aria-hidden
                  style={{ left: handBox.left, top: handBox.top, width: handBox.width, height: handBox.height }}
                  className={
                    `absolute rounded-lg pointer-events-none ` + (mismatch ? 'border-4 border-red-600/90' : 'border-4 border-green-600/90')
                  }
                />

                
                <div style={{ left: handBox.left + 8, top: Math.max(8, handBox.top - 26) }} className="absolute">
                  {mismatch ? (
                    <div className="inline-flex items-center rounded-md bg-red-600 px-3 py-1 text-white text-sm font-medium">Undetected</div>
                  ) : (
                    <div className="inline-flex items-center rounded-md bg-green-600 px-3 py-1 text-white text-sm font-medium">{`Pose ${Math.min(3, currentStep + 1)}`}</div>
                  )}
                </div>
              </div>
            ) : null}

            
            {!imageSrc && !localCaptured ? (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button onClick={() => captureToLocal()} className="rounded-full bg-white p-3 shadow-lg border">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                  </svg>
                </button>
              </div>
            ) : null}

            
            {countdown !== null ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-black/70 text-white text-6xl font-bold">{countdown}</div>
              </div>
            ) : null}
          </div>
        </div>

        
        {(imageSrc || localCaptured) ? (
          <div className="mt-4 mb-2 flex items-center justify-center gap-4">
            <button
              onClick={handleRetake}
              className="rounded-full bg-transparent px-5 py-2 text-sm border border-gray-300 text-black hover:bg-gray-50"
            >
              Retake photo
            </button>
            <button
              onClick={handleUse}
              className="rounded-full bg-teal-600 px-6 py-2 text-sm text-white shadow-md hover:opacity-95"
            >
              Submit
            </button>
          </div>
        ) : null}

        
        {!(imageSrc || localCaptured) ? (
          <p className="mb-6 text-sm text-gray-600">
            To take a picture, follow the hand poses in the order shown below. The system will automatically capture the image
            once the final pose is detected.
          </p>
        ) : null}

        
        {!(imageSrc || localCaptured) ? (
          <div className="flex items-center justify-center gap-4">
            <PoseBox>
              <img src="/assets/photo/3.png" alt="pose 3" className="w-10 h-10 object-contain" />
            </PoseBox>

            <div className="text-gray-400">&gt;</div>

            <PoseBox>
              <img src="/assets/photo/2.png" alt="pose 2" className="w-10 h-10 object-contain" />
            </PoseBox>

            <div className="text-gray-400">&gt;</div>

            <PoseBox>
              <img src="/assets/photo/1.png" alt="pose 1" className="w-10 h-10 object-contain" />
            </PoseBox>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function PoseBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center rounded bg-[#f6f1ea] p-4" style={{ width: 72, height: 72 }}>
      {children}
    </div>
  )
}

function HandIcon({ variant = 0 }: { variant?: number }) {
  if (variant === 1)
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 7V4" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 7V3" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 9V5" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 16c1.333-6 6-7 9-6" stroke="#2b2b2b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )

  if (variant === 2)
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 7v6" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 4v9" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 6v7" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 16c-3 0-6-1-8-5" stroke="#2b2b2b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )

  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9v6" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 5v10" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6v9" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 17c2-2 5-3 8-3" stroke="#2b2b2b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
