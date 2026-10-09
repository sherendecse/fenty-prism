"use client";
import {freckleStyles,frecklePoints} from './freckle-patterns';
import {cupReading} from './cup-reading';
import {Translated,LanguageSwitcher,PrismHeadlineWord,LocalizedText} from './i18n';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FaceMesh,
  NormalizedLandmark,
  Results as FaceMeshResults,
} from "@mediapipe/face_mesh";

import {IntensityHistory} from './intensity-history';
import Scan from './scan';
import BackButton from './back-button';
import HoldCompare from './hold-compare';
import {cameraFit} from './face-placement';
import {seasons,occasions,matchLook} from './look-match';
import {halloweenStyles} from './halloween-paint';
import {drawMakeup,makeupProfile,levelNames} from './makeup-renderer';
import StudioPlaceholder from './studio-placeholder';
import PrismPortrait from './prism-portrait';
import ProfileForm from './profile-form';
import Lottery from './lottery';
import {diceReading} from './dice-reading';
import {preferenceMatch,colorChoices,type PreferenceResult} from './preference-match';
import ContextIcon from './context-icon';
import {emptyProfile,type Profile} from './personal-match';
import {loadBrowserFaceMesh} from './face-loader';
import { Analysis, sample, looks, advice, candidates } from './face-engine';
import { ProductRecipe } from './recipe';

type Answers = Record<string, string[]>;
type Screen = "lottery" | "profile" | "scan" | "home" | "quiz" | "confirm" | "look" | "products" | "saved";
type SavedLook = {
  noteEn?:string;
  colorFamily?:string;
  palette?:{eye:string;blush:string;lip:string}|null;
  id: number;
  name: string;
  note: string;
  answers: Answers;
  eyeIntensity?: number;
  blushIntensity?: number;
  glowIntensity?: number;
  intensity?: number;
  analysis?: Analysis;
  lookId?: string;
  finish?: "glow" | "matte";
  level?: number;
  lipIntensity?: number;
  linerIntensity?: number;
  contourIntensity?: number;
  artIntensity?: number;
  freckles?:boolean;frecklePattern?:number;freckleIntensity?:number;
  artVariant?: number;
  season?: string;
  blindBox?: boolean;
  occasion?: string;
};

type BlushPalette = {
  liveStops: Array<[number, string]>;
  sampleCore: string;
  sampleMid: string;
  sampleEdge: string;
};

const blushPalettes: Record<
  "blackCherry" | "gilded" | "bareGold" | "softFocus",
  BlushPalette
> = {
  blackCherry: {
    liveStops: [
      [0, "rgba(105, 28, 53, 0.46)"],
      [0.18, "rgba(112, 34, 58, 0.42)"],
      [0.4, "rgba(126, 45, 67, 0.3)"],
      [0.64, "rgba(139, 58, 76, 0.15)"],
      [0.84, "rgba(145, 67, 83, 0.05)"],
      [1, "rgba(145, 67, 83, 0)"],
    ],
    sampleCore: "rgba(105, 28, 53, 0.48)",
    sampleMid: "rgba(126, 45, 67, 0.2)",
    sampleEdge: "rgba(145, 67, 83, 0.035)",
  },
  gilded: {
    liveStops: [
      [0, "rgba(145, 57, 45, 0.44)"],
      [0.18, "rgba(157, 65, 50, 0.4)"],
      [0.4, "rgba(174, 79, 61, 0.28)"],
      [0.64, "rgba(186, 95, 72, 0.14)"],
      [0.84, "rgba(195, 110, 84, 0.047)"],
      [1, "rgba(195, 110, 84, 0)"],
    ],
    sampleCore: "rgba(145, 57, 45, 0.45)",
    sampleMid: "rgba(174, 79, 61, 0.19)",
    sampleEdge: "rgba(195, 110, 84, 0.032)",
  },
  bareGold: {
    liveStops: [
      [0, "rgba(174, 76, 67, 0.42)"],
      [0.18, "rgba(186, 86, 74, 0.38)"],
      [0.4, "rgba(201, 102, 87, 0.27)"],
      [0.64, "rgba(214, 121, 101, 0.135)"],
      [0.84, "rgba(221, 137, 115, 0.045)"],
      [1, "rgba(221, 137, 115, 0)"],
    ],
    sampleCore: "rgba(174, 76, 67, 0.43)",
    sampleMid: "rgba(201, 102, 87, 0.18)",
    sampleEdge: "rgba(221, 137, 115, 0.03)",
  },
  softFocus: {
    liveStops: [
      [0, "rgba(151, 74, 91, 0.4)"],
      [0.18, "rgba(163, 82, 99, 0.36)"],
      [0.4, "rgba(180, 99, 114, 0.255)"],
      [0.64, "rgba(193, 118, 130, 0.128)"],
      [0.84, "rgba(202, 136, 146, 0.042)"],
      [1, "rgba(202, 136, 146, 0)"],
    ],
    sampleCore: "rgba(151, 74, 91, 0.41)",
    sampleMid: "rgba(180, 99, 114, 0.17)",
    sampleEdge: "rgba(202, 136, 146, 0.028)",
  },
};

const recommendedIntensities = {
  eye: 54,
  blush: 48,
  glow: 58,
} as const;

const optionLabels: Record<string, string> = {
  Everyday: "日常",
  Work: "上班",
  Class: "上课",
  "Date night": "约会",
  Dinner: "晚餐",
  "Wedding guest": "婚礼宾客",
  Bridal: "新娘妆",
  Party: "派对",
  Concert: "演唱会",
  Festival: "音乐节",
  Photoshoot: "拍摄",
  "Formal event": "正式场合",
  Vacation: "度假",
  Brunch: "早午餐",
  Interview: "面试",
  "Just experimenting": "尝试新风格",
  Dry: "干性",
  Oily: "油性",
  Combination: "混合性",
  Balanced: "中性",
  Sensitive: "敏感性",
  "Not sure": "不确定",
  "Soft glam": "柔和精致",
  "Clean & minimal": "干净极简",
  Bold: "大胆",
  Romantic: "浪漫",
  Editorial: "杂志感",
  Luminous: "通透光泽",
  "Velvet matte": "丝绒哑光",
  "Fresh-faced": "清新自然",
  Smoky: "烟熏",
  Sculpted: "立体轮廓",
  Playful: "灵动有趣",
  Monochrome: "同色系",
  "Sweet-cool": "甜酷",
  "High-fashion": "高级时装感",
  Sultry: "魅惑",
  Unexpected: "突破常规",
  "Heavy base": "厚重底妆",
  "Matte finish": "全哑光妆效",
  "High shine": "强烈光泽",
  Glitter: "闪粉",
  "Bold lip": "浓艳唇色",
  "Dark eyes": "深色眼妆",
  "False lashes": "假睫毛",
  "Sharp contour": "锐利修容",
  "Bright colour": "鲜艳色彩",
  "Warm tones": "暖色调",
  "Cool tones": "冷色调",
  Fragrance: "香味产品",
  Powder: "粉状产品",
  "Cream products": "膏状产品",
  "Long routine": "繁复步骤",
  "Nothing — surprise me": "没有限制，给我惊喜",
};

const savedLookNames: Record<string, string> = {
  "Gilded After Dark": "鎏金夜色",
  "Black Cherry Velvet": "黑樱桃丝绒",
  "Bare Gold Radiance": "裸金流光",
  "Soft Focus Muse": "柔焦缪斯",
};

const savedLookNotes: Record<string, string> = {
  "A softly sculpted complexion, molten-gold light and a confident smoked eye—edited to feel like you, never like a costume.":
    "柔和雕琢的轮廓、融金般的光泽与自信烟熏眼妆——保留你的本色，而非戴上一副面具。",
  "A breathable skin-first look with diffused definition, a warm wash of gold and a lip that looks naturally amplified.":
    "以轻盈透气的肌肤为主角，搭配柔和轮廓、温暖金调与自然放大的唇色。",
};

const emptyAnswers: Answers = { occasion: [], skin: [], feel: [], avoid: [] };

export default function Home() {
  const [screen, commitScreen] = useState<Screen>("home");
  const [flowPhase,setFlowPhase]=useState<'idle'|'out'|'in'>('idle');
  const fortuneRequest=useRef<AbortController|null>(null);
  const flowTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const setScreen=useCallback((next:Screen)=>{
    fortuneRequest.current?.abort();
    if(flowTimer.current)clearTimeout(flowTimer.current);
    if(next===screen){setFlowPhase('idle');return;}
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){commitScreen(next);setFlowPhase('idle');window.scrollTo(0,0);return;}
    setFlowPhase('out');flowTimer.current=setTimeout(()=>{commitScreen(next);window.scrollTo(0,0);setFlowPhase('in');flowTimer.current=setTimeout(()=>{setFlowPhase('idle');flowTimer.current=null;},420);},220);
  },[screen]);
  useEffect(()=>()=>{fortuneRequest.current?.abort();if(flowTimer.current)clearTimeout(flowTimer.current);},[]);
  const [profile,setProfile]=useState<Profile>(emptyProfile);
  const [lotteryResult,setLotteryResult]=useState<PreferenceResult|null>(null);
  const [preferenceReasonEn,setPreferenceReasonEn]=useState('');
  const [paletteFamily,setPaletteFamily]=useState('');
  const [recommendationNote,setRecommendationNote]=useState('');
  const [dailyPalette,setDailyPalette]=useState<{eye:string;blush:string;lip:string}|null>(null);
  const dailyPaletteRef=useRef(dailyPalette);useEffect(()=>{dailyPaletteRef.current=dailyPalette;},[dailyPalette]);
  const [generating,setGenerating]=useState(false);
  const generationRef=useRef(false);
  useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem('fenty-prism-profile')||'null');if(stored&&typeof stored==='object')setProfile({...emptyProfile,...Object.fromEntries(Object.keys(emptyProfile).filter(k=>typeof stored[k]==='string').map(k=>[k,stored[k]])),zodiac:'',likedColors:Array.isArray(stored.likedColors)?stored.likedColors.filter((x:unknown)=>colorChoices.some(c=>c.id===x)):[],avoidedColors:Array.isArray(stored.avoidedColors)?stored.avoidedColors.filter((x:unknown)=>colorChoices.some(c=>c.id===x)):[]});}catch{}},[]);
  const profileContinue=()=>{localStorage.setItem('fenty-prism-profile',JSON.stringify(profile));setScanStarted(true);setScanSession(x=>x+1);setScreen('scan');};
  const [scanStarted,setScanStarted]=useState(false);
  const [scanSession,setScanSession]=useState(0);
  const [analysis,setAnalysis]=useState<Analysis>(sample);
  const [season,setSeason]=useState('');
  const [blindBox,setBlindBox]=useState(false);
  const [occasion,setOccasion]=useState('');
  const [lipIntensity,setLipIntensity]=useState(58);
  const [linerIntensity,setLinerIntensity]=useState(48);
  const [contourIntensity,setContourIntensity]=useState(36);
  const [artIntensity,setArtIntensity]=useState(62);
  const [freckles,setFreckles]=useState(false);
  const [frecklePattern,setFrecklePattern]=useState(0),[freckleIntensity,setFreckleIntensity]=useState(60);
  const [artVariant,setArtVariant]=useState(0);
  const [artStatus,setArtStatus]=useState<'loading'|'ready'|'error'>('loading');
  const artRef=useRef<HTMLImageElement|null>(null);
  const geometryRef=useRef<NormalizedLandmark[]|null>(null);
  useEffect(()=>{const atlas=new Image();atlas.onload=()=>{artRef.current=atlas;setArtStatus('ready');};atlas.onerror=()=>setArtStatus('error');atlas.src='/images/halloween-paint-atlas.png';return()=>{atlas.onload=null;atlas.onerror=null;};},[]);
  const [originalOnly,setOriginalOnly]=useState(false);
  const viewRef=useRef({originalOnly:false,level:1});
  const [lookId,setLookId]=useState('spring');
  const [intensityLevel,setIntensityLevel]=useState(1);
  useEffect(()=>{viewRef.current={originalOnly,level:intensityLevel};},[originalOnly,intensityLevel]);

  const compareHold=useCallback((held:boolean)=>{viewRef.current.originalOnly=held;setOriginalOnly(held);},[]);
  const [finish,setFinish]=useState<'glow'|'matte'>('glow');
  const finishRef=useRef(finish);
  useEffect(()=>{finishRef.current=finish;},[finish]);
  const selectedLook=looks.find(x=>x.id===lookId)||looks[0];
  const analysisRef=useRef(analysis), lookRef=useRef(selectedLook);
  useEffect(()=>{analysisRef.current=analysis;lookRef.current=selectedLook;},[analysis,selectedLook]);
  const [step, setStep] = useState(0);
  const [editingFromConfirm, setEditingFromConfirm] = useState(false);
  const [savedReturnScreen, setSavedReturnScreen] = useState<Screen>("home");
  const [lookReturnScreen, setLookReturnScreen] = useState<Screen>("confirm");
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [eyeIntensity, setEyeIntensity] = useState<number>(
    recommendedIntensities.eye,
  );
  const [blushIntensity, setBlushIntensity] = useState<number>(
    recommendedIntensities.blush,
  );
  const [glowIntensity, setGlowIntensity] = useState<number>(
    recommendedIntensities.glow,
  );
  const [saved, setSaved] = useState<SavedLook[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(
        localStorage.getItem("fenty-saved-looks") || "[]",
      ) as SavedLook[];
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState("");
  const [cameraMode, setCameraMode] = useState<
    "sample" | "consent" | "starting" | "live" | "error"
  >("sample");
  const [cameraPreview,setCameraPreview]=useState(false);
  const [cameraError, setCameraError] = useState("");
  const [faceVisible, setFaceVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraFrameRef = useRef<number | null>(null);
  const cameraBusyRef = useRef(false);
  const cameraSessionRef = useRef(0);
  const faceVisibleRef = useRef(false);
  const intensityRef = useRef({
    eye: recommendedIntensities.eye / 100,
    blush: recommendedIntensities.blush / 100,
    glow: recommendedIntensities.glow / 100,
    lip:.58,liner:.48,contour:.36,art:.62,variant:0,freckles:false,frecklePattern:0,freckleIntensity:.6,
  });
  const blushPaletteRef = useRef<BlushPalette>(blushPalettes.softFocus);

  useEffect(() => {
    intensityRef.current = {
      eye: eyeIntensity / 100,
      blush: blushIntensity / 100,
      glow: glowIntensity / 100,
      lip:lipIntensity/100,liner:linerIntensity/100,contour:contourIntensity/100,art:artIntensity/100,variant:artVariant,freckles,frecklePattern,freckleIntensity:freckleIntensity/100,
    };
  }, [eyeIntensity, blushIntensity, glowIntensity,lipIntensity,linerIntensity,contourIntensity,artIntensity,artVariant,freckles,frecklePattern,freckleIntensity]);

  const intensityHistory=useRef(new IntensityHistory());
  const [intensityUndoCount,setIntensityUndoCount]=useState(0);
  const intensitySnapshot=()=>({eye:eyeIntensity,blush:blushIntensity,glow:glowIntensity,lip:lipIntensity,liner:linerIntensity,contour:contourIntensity,art:artIntensity,level:intensityLevel});
  const recordIntensity=()=>{intensityHistory.current.record(intensitySnapshot());setIntensityUndoCount(intensityHistory.current.count);};
  const changeIntensity=(control:string,value:number,setValue:(value:number)=>void)=>{
    intensityHistory.current.change(control,intensitySnapshot());setIntensityUndoCount(intensityHistory.current.count);setValue(value);setOriginalOnly(false);
  };
  const undoIntensity=()=>{const previous=intensityHistory.current.undo();if(!previous)return;
    setEyeIntensity(previous.eye);setBlushIntensity(previous.blush);setGlowIntensity(previous.glow);setLipIntensity(previous.lip);setLinerIntensity(previous.liner);setContourIntensity(previous.contour);setArtIntensity(previous.art);setIntensityLevel(previous.level);setOriginalOnly(false);setIntensityUndoCount(intensityHistory.current.count);
  };
  useEffect(()=>{intensityHistory.current.clear();setIntensityUndoCount(0);},[lookId]);
  const resetIntensities = () => {
    if(screen==='look')recordIntensity();
    setIntensityLevel(1);
    setOriginalOnly(false);
    setEyeIntensity(recommendedIntensities.eye);
    setBlushIntensity(recommendedIntensities.blush);
    setGlowIntensity(recommendedIntensities.glow);
    setLipIntensity(58);setLinerIntensity(48);setContourIntensity(36);setArtIntensity(62);
  };

  const stopCamera = useCallback(async (returnToSample = true) => {
    cameraSessionRef.current++;
    setCameraPreview(false);
    if (cameraFrameRef.current !== null) {
      cancelAnimationFrame(cameraFrameRef.current);
      cameraFrameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    const activeFaceMesh = faceMeshRef.current;
    faceMeshRef.current = null;
    if (activeFaceMesh) {
      try {
        await activeFaceMesh.close();
      } catch {}
    }
    cameraBusyRef.current = false;
    faceVisibleRef.current = false;
    setFaceVisible(false);
    if (returnToSample) setCameraMode("sample");
  }, []);

  useEffect(() => {
    if (screen !== "look") void stopCamera();
  }, [screen, stopCamera]);

  useEffect(
    () => () => {
      if (cameraFrameRef.current !== null)
        cancelAnimationFrame(cameraFrameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void faceMeshRef.current?.close();
    },
    [],
  );

  const drawCameraFrame = useCallback((results: FaceMeshResults) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr))
      canvas.width = Math.round(width * dpr);
    if (canvas.height !== Math.round(height * dpr))
      canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // A failed overlay must never carry multiply/opacity into the next frame.
    // Reset the complete compositing state before painting the camera image.
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    ctx.clearRect(0, 0, width, height);

    const detected=results.multiFaceLandmarks?.[0];
    const previous=geometryRef.current;
    const reset=!detected||!previous||Math.hypot(detected[1].x-previous[1].x,detected[1].y-previous[1].y)>.055;
    const landmarks=detected?.map((p,i)=>reset?{...p}:{...p,x:p.x*.72+previous![i].x*.28,y:p.y*.72+previous![i].y*.28});
    geometryRef.current=landmarks||null;
    const {drawWidth,drawHeight,offsetX,offsetY}=cameraFit(width,height,video.videoWidth,video.videoHeight);

    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();

    const hasFace = Boolean(landmarks?.length);
    if (hasFace !== faceVisibleRef.current) {
      faceVisibleRef.current = hasFace;
      setFaceVisible(hasFace);
    }
    if (!landmarks) return;

    const point = (landmark: NormalizedLandmark) => ({x:width-(offsetX+landmark.x*drawWidth),y:offsetY+landmark.y*drawHeight});
    if(!viewRef.current.originalOnly)drawMakeup(ctx,landmarks,point,analysisRef.current,lookRef.current.id,{...intensityRef.current,finish:finishRef.current,level:viewRef.current.level,atlas:artRef.current,liveLandmarks:detected,palette:dailyPaletteRef.current});

  }, []);

  const startCamera = useCallback(async () => {
    const session=++cameraSessionRef.current;
    setCameraMode("starting");
    setCameraError("");
    geometryRef.current=null;
    try {
      if (!navigator.mediaDevices?.getUserMedia)throw new Error("此浏览器不支持摄像头访问。");
      // Start model download and camera permission in parallel; show the camera
      // before tracking initialization finishes.
      const modelPromise=loadBrowserFaceMesh();void modelPromise.catch(()=>{});
      const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:960},height:{ideal:720}}});
      if(session!==cameraSessionRef.current){stream.getTracks().forEach(t=>t.stop());return;}
      streamRef.current=stream;
      const video=videoRef.current;if(!video)throw new Error("摄像头预览无法启动。");
      video.srcObject=stream;await video.play();if(session!==cameraSessionRef.current)return;setCameraPreview(true);
      const FaceMeshModel=await modelPromise;if(session!==cameraSessionRef.current)return;
      const faceMesh=new FaceMeshModel({locateFile:(file)=>`/mediapipe/${file}`});
      faceMesh.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:.65,minTrackingConfidence:.65});
      faceMesh.onResults(drawCameraFrame);faceMeshRef.current=faceMesh;
      await faceMesh.initialize();if(session!==cameraSessionRef.current){void faceMesh.close();return;}
      setCameraMode("live");

      const trackFrame = async () => {
        if (!faceMeshRef.current || !videoRef.current) return;
        if (!cameraBusyRef.current && videoRef.current.readyState >= 2) {
          cameraBusyRef.current = true;
          try {
            await faceMeshRef.current.send({ image: videoRef.current });
          } catch {
          } finally {
            cameraBusyRef.current = false;
          }
        }
        cameraFrameRef.current = requestAnimationFrame(trackFrame);
      };
      cameraFrameRef.current = requestAnimationFrame(trackFrame);
    } catch (error) {
      await stopCamera(false);
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "未获得摄像头权限，你仍可使用示范模特继续体验。"
          : error instanceof Error
            ? error.message
            : "摄像头无法启动。";
      setCameraError(message);
      setCameraMode("error");
    }
  }, [drawCameraFrame, stopCamera]);

  useEffect(() => {
    if (screen === "look") void startCamera();
  }, [screen, startCamera]);

  const look = useMemo(() => ({
    name:selectedLook.name,
    note:recommendationNote||matchLook(season,occasion,analysis).reason,
    tags:[selectedLook.category,selectedLook.scene,analysis.shape],accent:selectedLook.color,
    blushPalette:blushPalettes.softFocus,
  }),[selectedLook,analysis,intensityLevel,season,occasion,recommendationNote]);

  useEffect(() => {
    blushPaletteRef.current = look.blushPalette;
  }, [look.blushPalette]);

  const begin = () => {
    setSeason('');setBlindBox(false);setOccasion('');setRecommendationNote('');
    setFinish("glow");
    setIntensityLevel(1);
    resetIntensities();
    setAnswers(emptyAnswers);
    setStep(0);
    setEditingFromConfirm(false);
    setScreen("profile");

  };
  function applyPreferenceMatch(matched:PreferenceResult,returnScreen:Screen){
    setDailyPalette(matched.palette);setPaletteFamily(matched.colorFamily);setRecommendationNote(matched.reason);setPreferenceReasonEn(matched.reasonEn);setLookId(matched.id);
    intensityHistory.current.clear();setIntensityUndoCount(0);
    setArtVariant(analysis.widest===2?1:analysis.widest===3?2:analysis.chin===1?0:3);setFreckles(false);setFrecklePattern(0);setFreckleIntensity(60);setFinish(['sport','autumn','shadow'].includes(matched.id)?'matte':'glow');resetIntensities();setLookReturnScreen(returnScreen);
  }
  function generateLook(){
    if(!season||!occasion)return;
    if(blindBox){setLotteryResult(null);setScreen('lottery');return;}
    applyPreferenceMatch(preferenceMatch(season,occasion,analysis,profile,saved),'quiz');setScreen('look');
  }
  const currentSaveSignature=JSON.stringify({lookId,analysis,finish,intensityLevel,season,blindBox,occasion,paletteFamily,eyeIntensity,blushIntensity,glowIntensity,lipIntensity,linerIntensity,contourIntensity,artIntensity,artVariant,freckles,frecklePattern,freckleIntensity});
  const [savedSignature,setSavedSignature]=useState<string|null>(null);
  const isCurrentSaved=savedSignature===currentSaveSignature;
  const saveLook = () => {
    if(isCurrentSaved)return;
    setSavedSignature(currentSaveSignature);
    const item = {
      id: Date.now(),
      name: look.name,
      note: look.note,
      answers,
      analysis,
      lookId,
      finish,
      level:intensityLevel,
      season,blindBox,occasion,palette:dailyPalette,colorFamily:paletteFamily,noteEn:preferenceReasonEn,
      lipIntensity,linerIntensity,contourIntensity,artIntensity,artVariant,freckles,frecklePattern,freckleIntensity,
      eyeIntensity,
      blushIntensity,
      glowIntensity,
    };
    const nextSaved = [item, ...saved].slice(0, 12);
    setSaved(nextSaved);
    localStorage.setItem("fenty-saved-looks", JSON.stringify(nextSaved));
    setNotice("妆容已收藏");
    setTimeout(() => setNotice(""), 2200);
  };

  const openSavedLook = (item: SavedLook) => {
    setSeason(item.season==='surprise'?'':item.season||'');setBlindBox(item.blindBox??item.season==='surprise');setOccasion(item.occasion||'daily');
    setPreferenceReasonEn(item.noteEn||'');setPaletteFamily(item.colorFamily||'');setRecommendationNote(item.note);setDailyPalette(item.palette&&Object.values(item.palette).every(c=>/^#[\da-f]{6}$/i.test(c))?item.palette:null);
    setAnswers(item.answers);
    setAnalysis(item.analysis||sample);
    setLookId(item.lookId||"spring");
    setFinish(item.finish||"glow");
    setLipIntensity(item.lipIntensity??58);setLinerIntensity(item.linerIntensity??48);setContourIntensity(item.contourIntensity??36);setArtIntensity(item.artIntensity??62);setArtVariant(item.artVariant??0);setFreckles(item.freckles===true);setFrecklePattern(item.frecklePattern??0);setFreckleIntensity(item.freckleIntensity??60);
    setIntensityLevel(item.level??1);
    setEyeIntensity(
      item.eyeIntensity ?? item.intensity ?? recommendedIntensities.eye,
    );
    setBlushIntensity(item.blushIntensity ?? recommendedIntensities.blush);
    setGlowIntensity(item.glowIntensity ?? recommendedIntensities.glow);
    setLookReturnScreen("saved");
    setScreen("look");

  };

  return (
    <Translated><main className="site-shell">
      {screen!=='home'&&screen!=='scan'&&<BackButton onClick={()=>{const previous=screen==='profile'?'home':screen==='quiz'?'scan':screen==='lottery'?'quiz':screen==='look'?lookReturnScreen:screen==='products'?'look':savedReturnScreen==='saved'?'home':savedReturnScreen;setScreen(previous==='confirm'?'quiz':previous);if(previous==='scan')setScanStarted(true);}}/>}
      <header className="nav">
        <button
          className="wordmark"
          onClick={() => {
            setEditingFromConfirm(false);
            setScreen("home");
          }}
        >
          万象 <span className="prism-name">FENTY PRISM</span><span className="brand-partner">FENTY BEAUTY</span>
        </button>
        <div className="nav-meta"><LanguageSwitcher/>
          <span className="edition">AI 妆容探索 / 01</span>
          <button
            className="saved-button"
            onClick={() => {
              if (screen !== "saved") setSavedReturnScreen(screen);
              setScreen("saved");

            }}
          >
            我的收藏 <i>{saved.length}</i>
          </button>
        </div>
      </header>

      <div className="page-flow" data-phase={flowPhase}>
      {screen === "home" && (
        <section className="hero page-enter">
          <div className="hero-copy">
            <p className="kicker">万象 · AI 妆容探索</p>
            <h1>
              你，
              <br />
              既是唯一，
              <br />
              也是<PrismHeadlineWord/>。
            </h1>
            <p className="dek">
              从肤色、脸型到季节与场景，探索适合你的 Fenty Beauty 产品、上妆位置与实时试妆。
            </p>
            <button className="gold-cta" onClick={begin}>
              <span>开始探索</span>

            </button>
            <p className="micro">肤色 → 脸型 → 场景 → 实时试妆</p>
          </div>
          <PrismPortrait/>
        </section>
      )}

      {screen==='lottery'&&<Lottery result={lotteryResult} onDraw={(number,dice,cup)=>{const matched=preferenceMatch(season,occasion,analysis,profile,saved,number);const result=cup!==undefined?{...matched,...cupReading(cup)}:dice?{...matched,dice,...diceReading(...dice)}:matched;setLotteryResult(result);return result;}} onContinue={()=>{if(lotteryResult){applyPreferenceMatch(lotteryResult,'lottery');setScreen('look');}}}/>}
      {screen==='profile'&&<ProfileForm profile={profile} onChange={setProfile} onContinue={profileContinue}/>}
      {scanStarted&&<div hidden={screen!=='scan'}><Scan key={scanSession} visible={screen==='scan'} onBack={()=>setScreen('profile')} onComplete={a=>{setAnalysis(a);setScreen('quiz');}}/></div>}
      {screen==='quiz'&&<section className="quiz page-enter">
        <div className="flow-steps">{['肤色与拍摄','脸型与特点','季节与场景','你的妆容'].map((n,i)=><span key={n} className={i===2?'current':''}>0{i+1} {n}</span>)}</div>
        <p className="kicker">03 / 季节与场景</p><h2>为今天，选择一种氛围。</h2>
        <p className="quiz-hint">选择季节风格与场景用途，我们会结合你的肤色、脸型和局部特点，自动匹配妆容与上妆位置。</p>
        <div className="context-selection"><h3>季节风格 <small>选择一项</small></h3><div className="context-options">{seasons.filter(x=>x.id!=='surprise').map(x=><button key={x.id} aria-pressed={season===x.id} className={season===x.id?'selected':''} onClick={()=>setSeason(x.id)}><strong>{x.name}<ContextIcon id={x.id}/></strong>{x.note&&<span>{x.note}</span>}</button>)}</div><h3>场景用途 <small>选择一项</small></h3><div className="context-options occasions">{occasions.map(x=><button key={x.id} aria-pressed={occasion===x.id} className={occasion===x.id?'selected':''} onClick={()=>setOccasion(x.id)}><strong>{x.name}<ContextIcon id={x.id}/></strong>{x.note&&<span>{x.note}</span>}</button>)}</div></div>
        <section className="context-selection surprise-section" aria-label="盲盒体验"><h3>盲盒体验</h3><div className="context-options">{seasons.filter(x=>x.id==='surprise').map(x=><button key={x.id} aria-pressed={blindBox} className={blindBox?'selected':''} onClick={()=>setBlindBox(value=>!value)}><strong>{x.name}<ContextIcon id={x.id}/></strong></button>)}</div></section>
        <div className="quiz-actions"><button className="gold-cta" disabled={!season||!occasion||generating} onClick={()=>{void generateLook();}}>{blindBox?'打开盲盒惊喜':'生成我的妆容'}</button></div>

      </section>}
      {screen === "look" && (
        <section className="result page-enter">
          <div className="result-left">
            <div
              className={`result-visual portrait ${cameraMode === "live" ? "camera-live" : cameraMode === "starting" && cameraPreview ? "camera-starting" : ""}`}
              style={
                {
                  "--eye-intensity": eyeIntensity / 100,
                  "--blush-intensity": blushIntensity / 100,
                  "--glow-intensity": glowIntensity / 100,
                  "--blush-core": look.blushPalette.sampleCore,
                  "--blush-mid": look.blushPalette.sampleMid,
                  "--blush-edge": look.blushPalette.sampleEdge,
                } as React.CSSProperties
              }
            >
            <video ref={videoRef} muted playsInline aria-hidden="true" />
            <canvas
              ref={canvasRef}
              className="camera-canvas"
              aria-label="实时摄像头妆容预览"
            />
            {cameraMode !== "live" && !cameraPreview && <StudioPlaceholder title="在你的脸上，看看新妆容" subtitle="开启摄像头，预览贴合面容的妆容与彩绘"/>}
            {(cameraMode === "sample" || cameraMode === "error") && (
              <div className="camera-entry">
                <button onClick={() => void startCamera()}>
                  <span>◉</span> 实时试妆
                </button>
                {cameraMode === "error" && <p>{cameraError}</p>}
              </div>
            )}
            {cameraMode === "consent" && (
              <div className="camera-consent" role="dialog" aria-modal="true">
                <small>实时试妆</small>
                <h3>在你的脸上预览妆容。</h3>
                <p>
                  摄像头画面仅在此设备上处理，不会被录制、上传或保存。
                </p>
                <div>
                  <button className="camera-allow" onClick={startCamera}>
                    允许使用摄像头
                  </button>
                  <button onClick={() => setCameraMode("sample")}>暂时不要</button>
                </div>
              </div>
            )}
            {cameraMode === "starting" && (
              <div className="camera-loading" role="status">
                <span />
                正在准备实时试妆…
              </div>
            )}
            {cameraMode === "live" && (
              <>
                <div className="camera-live-controls">
                  <span className={faceVisible ? "face-found" : ""}>
                    {faceVisible ? "已识别面部" : "请将面部移入画面"}
                  </span>
                  <button onClick={() => void stopCamera()}>关闭摄像头</button>
                </div>
                <p className="camera-lighting-tip">
                  请在光线充足且均匀的环境中测试，过暗或背光可能影响妆效准确度。
                </p>
              </>
            )}
            </div>
            <div className="try-controls"
              onPointerDownCapture={()=>intensityHistory.current.endGesture()}
              onPointerUpCapture={()=>intensityHistory.current.endGesture()}
              onPointerCancelCapture={()=>intensityHistory.current.endGesture()}
              onBlurCapture={()=>intensityHistory.current.endGesture()}
              onKeyDownCapture={e=>{if(!e.repeat&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key))intensityHistory.current.endGesture();}}
              onKeyUpCapture={()=>intensityHistory.current.endGesture()}>
            {cameraMode==='live'&&<div className="view-tools"><HoldCompare onChange={compareHold}/><span className="camera-framing-note">普通镜头 · 松开即恢复妆容</span></div>}
            <p className="strength-description">{levelNames[intensityLevel]}：{['轻色、细眼线与淡唇色，保留本色。','色彩与眼尾清晰呈现，适度增加光泽。','更鲜明的眼唇重点，金属、宝石与彩绘细节更清晰。'][intensityLevel]}</p>
            <div className="strength"><span>试妆强度</span>{['弱','中','强'].map((x,i)=><button key={x} aria-pressed={intensityLevel===i} className={intensityLevel===i?'selected':''} onClick={()=>{recordIntensity();setIntensityLevel(i);setEyeIntensity([25,54,85][i]);setBlushIntensity([22,48,80][i]);setGlowIntensity([28,58,88][i]);setLipIntensity([28,58,88][i]);setLinerIntensity([22,48,78][i]);setContourIntensity([18,36,58][i]);setArtIntensity([35,62,88][i]);}}>{x}</button>)}</div>
            {lookId==='graphic'&&<div className="art-options"><h3>万圣节彩绘 · 四款画法</h3><p>先为你匹配一款，也可切换查看四种画法。图案随脸颊与鼻梁移动，浓淡可单独调整。</p><div className="art-grid">{halloweenStyles.map((style,i)=><button key={style.name} aria-pressed={artVariant===i} onClick={()=>{setArtVariant(i);setOriginalOnly(false);}}><span className="art-preview" style={{backgroundPosition:`${i%2?100:0}% ${i>1?100:0}%`}}/><strong>{style.name}</strong><small>{style.note}</small></button>)}</div>{artStatus!=='ready'&&<p role="status">{artStatus==='loading'?'正在准备彩绘…':'彩绘未加载，请刷新后重试。'}</p>}<div className="intensity"><div><label htmlFor="art-intensity">彩绘浓淡</label><output>{artIntensity}%</output></div><input id="art-intensity" type="range" min="0" max="100" value={artIntensity} onChange={e=>changeIntensity('art',+e.target.value,setArtIntensity)}/><div className="range-labels"><span>轻透颜料</span><span>鲜明彩绘</span></div></div></div>}
            {!['graphic','gem'].includes(lookId)&&<div className="freckle-options"><h3>雀斑点缀</h3><div><button aria-pressed={!freckles} onClick={()=>setFreckles(false)}>不添加</button><button aria-pressed={freckles} onClick={()=>{setFreckles(true);setOriginalOnly(false);}}>添加雀斑</button></div>{freckles&&<div className="freckle-picker"><div className="freckle-pattern-grid">{freckleStyles.map((style,i)=><button key={style.name} aria-pressed={frecklePattern===i} onClick={()=>{setFrecklePattern(i);setOriginalOnly(false);}}><svg viewBox="0 0 160 75" aria-hidden="true"><path d="M80 10v24m-7 3q7 5 14 0" fill="none" stroke="#d3b48b" strokeWidth="1"/>{frecklePoints(i).map((p,k)=><circle key={k} cx={12+p.u*136} cy={28+p.v*36} r={p.size*650} fill="#b77c4f" opacity={p.weight}/>)}</svg><strong>{style.name}</strong></button>)}</div><div className="intensity"><div><label htmlFor="freckle-intensity">雀斑强度</label><span className="freckle-intensity-actions"><output>{freckleIntensity}%</output><button type="button" disabled={freckleIntensity===60} onClick={()=>{setFreckleIntensity(60);setOriginalOnly(false);}}>重置</button></span></div><input id="freckle-intensity" type="range" min="0" max="100" value={freckleIntensity} onChange={e=>{setFreckleIntensity(+e.target.value);setOriginalOnly(false);}}/><div className="range-labels"><span>轻淡</span><span>鲜明</span></div></div></div>}<p>选择分布后可独立调整浓淡，雀斑随脸部移动。</p></div>}
            <div className="finish-preview"><span>底妆妆效</span><button aria-pressed={finish==='glow'} onClick={()=>setFinish('glow')}>水光</button><button aria-pressed={finish==='matte'} onClick={()=>setFinish('matte')}>柔雾</button><p>{finish==='glow'?'保留肌肤光泽，颧骨上缘微微提亮。':'减少反光，底妆更柔和，适合通勤与运动场景。'}</p></div>
            <div className="intensity-controls">
              <div className="intensity-reset-row">
                <span>推荐强度</span><div className="intensity-history-actions"><button type="button" disabled={intensityUndoCount===0} onClick={undoIntensity}>撤销</button>
                <button type="button" onClick={resetIntensities}>
                  重置
                </button></div>
              </div>
              <p className="intensity-demo-note">
                实时预览包含眼影、腮红、高光、唇色、轻修容与轻底妆，保留肌肤纹理并柔化边缘；颜色为妆效模拟，不代表实物色差。金属闪点、宝石与万圣节彩绘按妆容出现。
              </p>
              <div className="intensity">
                <div>
                  <label htmlFor="eye-intensity">眼影强度</label>
                  <output>{eyeIntensity}%</output>
                </div>
                <input
                  id="eye-intensity"
                  type="range"
                  min="0"
                  max="100"
                  value={eyeIntensity}
                  onChange={e=>changeIntensity('eye',+e.target.value,setEyeIntensity)}
                />
                <div className="range-labels">
                  <span>轻柔晕染</span>
                  <span>鲜明眼妆</span>
                </div>
              </div>
              <div className="intensity">
                <div>
                  <label htmlFor="blush-intensity">腮红强度</label>
                  <output>{blushIntensity}%</output>
                </div>
                <input
                  id="blush-intensity"
                  type="range"
                  min="0"
                  max="100"
                  value={blushIntensity}
                  onChange={e=>changeIntensity('blush',+e.target.value,setBlushIntensity)}
                />
                <div className="range-labels">
                  <span>自然红润</span>
                  <span>鲜明红润</span>
                </div>
              </div>
              {[{id:'lip',name:'唇色强度',value:lipIntensity,set:setLipIntensity,low:'本色透润',high:'鲜明唇色'},{id:'liner',name:'眼线强度',value:linerIntensity,set:setLinerIntensity,low:'贴根轻描',high:'清晰眼尾'},{id:'contour',name:'修容强度',value:contourIntensity,set:setContourIntensity,low:'保留轮廓',high:'局部加强'}].map(control=><div className="intensity" key={control.id}><div><label htmlFor={`${control.id}-intensity`}>{control.name}</label><output>{control.value}%</output></div><input id={`${control.id}-intensity`} type="range" min="0" max="100" value={control.value} onChange={e=>changeIntensity(control.id,+e.target.value,control.set)}/><div className="range-labels"><span>{control.low}</span><span>{control.high}</span></div></div>)}
              <div className="intensity">
                <div>
                  <label htmlFor="glow-intensity">高光强度</label>
                  <output>{glowIntensity}%</output>
                </div>
                <input
                  id="glow-intensity"
                  type="range"
                  min="0"
                  max="100"
                  value={glowIntensity}
                  onChange={e=>changeIntensity('glow',+e.target.value,setGlowIntensity)}
                />
                <div className="range-labels">
                  <span>柔和微光</span>
                  <span>通透光泽</span>
                </div>
              </div>
            </div>


            </div>
          </div>
          <div className="result-copy">
            <p className="kicker">04 / 你的万象妆容</p>
            <span className="data-badge">{analysis.source==='sample'?'示例脸部资料':'摄像头几何估计'} · {analysis.undertone}底色</span>
            <h2>{look.name}</h2>
            <p className="look-note">{preferenceReasonEn?<LocalizedText zh={look.note} en={preferenceReasonEn}/>:look.note}</p><div className="makeup-signature"><h3>这个妆容的特点</h3><p>{makeupProfile(lookId).detail}{dailyPalette&&<span className="preference-palette-note"> 配色结合你的喜欢与避开选择。</span>}</p><div>{[dailyPalette?.eye||makeupProfile(lookId).eye,dailyPalette?.blush||makeupProfile(lookId).blush,dailyPalette?.lip||makeupProfile(lookId).lip].map((c,i)=><span key={i}><i style={{background:c}}/>{['眼妆','腮红','唇色'][i]}</span>)}</div></div>
            <div className="look-tags">
              {look.tags.join(' · ')}
            </div>

            <div className="feature-advice"><h3>亮点与修饰建议</h3><p><b>你的亮点</b>{advice(analysis).highlight}</p><p><b>可调整的比例</b>{advice(analysis).balance}</p><p><b>腮红与眼妆</b>{advice(analysis).blush} {advice(analysis).eyes}</p></div>

            <button
              className="gold-cta"
              onClick={() => {
                setScreen("products");

              }}
            >
              <span>查看推荐产品</span>

            </button>
          </div>
        </section>
      )}

      {screen === "products" && (
        <section className="products page-enter">

          <ProductRecipe analysis={analysis} lookId={lookId} finish={finish} onFinish={setFinish} colorFamily={paletteFamily} freckles={freckles} frecklePattern={frecklePattern} freckleIntensity={freckleIntensity}/>
          <div className="save-panel">
            <div>
              <small>喜欢这套妆容吗？</small>
              <h3>把它收藏起来。</h3>
              <p>你的妆容推荐仅保存在此设备上。</p>
            </div>
            <div className="save-actions"><button className="home-return" onClick={()=>setScreen('home')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8M5 10v11h5v-7h4v7h5V10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span>回到首页</span></button><button className="gold-cta" aria-pressed={isCurrentSaved} onClick={saveLook}>
              <span>收藏推荐</span><b aria-hidden="true">{isCurrentSaved?'♥':'♡'}</b>
            </button></div>
          </div>
        </section>
      )}

      {screen === "saved" && (
        <section className="saved-page page-enter">

          <p className="kicker">你的妆容档案</p>
          <h2>已收藏的推荐。</h2>
          {saved.length === 0 ? (
            <div className="empty-state">
              <span>♡</span>
              <h3>还没有收藏妆容。</h3>
              <p>你之后收藏的心仪妆容会出现在这里。</p>
              <button className="gold-cta" onClick={begin}>
                <span>创建妆容</span>

              </button>
            </div>
          ) : (
            <div className="saved-grid">
              {saved.map((item, i) => (
                <article
                  key={item.id}
                  className="saved-card"
                  role="button"
                  tabIndex={0}
                  aria-label={`打开妆容：${savedLookNames[item.name] ?? item.name}`}
                  onClick={() => openSavedLook(item)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openSavedLook(item);
                    }
                  }}
                >
                  <div className="saved-palette"><div className="palette-strip">{(()=>{const l=looks.find(x=>x.id===item.lookId)||looks[0];return [l.eye,l.color,l.lip].map((c,k)=><span key={k} style={{background:c}}/>);})()}</div><span>0{i+1}</span></div>
                  <small>已收藏的万象妆容</small>
                  <h3>{savedLookNames[item.name] ?? item.name}</h3>
                  <p>{savedLookNotes[item.note] ?? item.note}</p>
                  <div>
                    <span className="saved-open">打开妆容</span>
                    <button
                      aria-label="删除已收藏的妆容"
                      onClick={(event) => {
                        event.stopPropagation();
                        const n = saved.filter((x) => x.id !== item.id);
                        setSaved(n);
                        localStorage.setItem(
                          "fenty-saved-looks",
                          JSON.stringify(n),
                        );
                      }}
                    >
                      ×
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      </div>
      {notice && (
        <div className="toast">
          {notice} <span>✓</span>
        </div>
      )}
      <footer>
        <span>万象</span>
        <span>不止一种美，不止一个你</span>
        <span>概念体验 · 2026</span>
      </footer>
    </main></Translated>
  );
}
