import { supabase } from "@/integrations/supabase/client";

export type MeasurementValues = Record<string, number | null>;

export type MeasurementRecord = {
  user_id: string;
  values: MeasurementValues;
  type: string;
  created_at: string;
  updated_at: string;
};

export type MeasurementField = {
  key: string;
  en: string;
  it: string;
  unit: "mm" | "°";
};

export type MeasurementGroup = {
  en: string;
  it: string;
  fields: MeasurementField[];
};

export const MEASUREMENT_GROUPS: MeasurementGroup[] = [
  {
    en: "Bust & chest",
    it: "Busto e petto",
    fields: [
      { key: "fullBustScope", en: "Full bust circumference", it: "Circonferenza busto", unit: "mm" },
      { key: "bustWidth", en: "Bust width", it: "Larghezza busto", unit: "mm" },
      { key: "bustDepth", en: "Bust depth", it: "Profondità busto", unit: "mm" },
      { key: "bustPointDistance", en: "Bust point distance", it: "Distanza punti seno", unit: "mm" },
      { key: "underBustDistance", en: "Under bust distance", it: "Distanza sotto seno", unit: "mm" },
      { key: "frontLength", en: "Front length", it: "Lunghezza davanti", unit: "mm" },
    ],
  },
  {
    en: "Back & shoulders",
    it: "Schiena e spalle",
    fields: [
      { key: "backWidth", en: "Back width", it: "Larghezza schiena", unit: "mm" },
      { key: "highBackWidth", en: "High back width", it: "Larghezza schiena alta", unit: "mm" },
      { key: "backLength", en: "Back length", it: "Lunghezza dietro", unit: "mm" },
      { key: "fullShoulderWidth", en: "Full shoulder width", it: "Larghezza spalle totale", unit: "mm" },
      { key: "shoulderDepth", en: "Shoulder depth", it: "Profondità spalla", unit: "mm" },
      { key: "shoulderContouring", en: "Shoulder contouring", it: "Sagomatura spalla", unit: "mm" },
      { key: "neckWidth", en: "Neck width", it: "Larghezza collo", unit: "mm" },
      { key: "neckContouring", en: "Neck contouring", it: "Sagomatura collo", unit: "mm" },
      { key: "horizontalHeadScope", en: "Head circumference", it: "Circonferenza testa", unit: "mm" },
    ],
  },
  {
    en: "Arms",
    it: "Braccia",
    fields: [
      { key: "armLength", en: "Arm length", it: "Lunghezza braccio", unit: "mm" },
      { key: "armDiameter", en: "Arm diameter", it: "Diametro braccio", unit: "mm" },
      { key: "armDepth", en: "Armhole depth", it: "Profondità giro manica", unit: "mm" },
      { key: "upperArmScope", en: "Upper arm circumference", it: "Circonferenza braccio", unit: "mm" },
      { key: "ellbowDepth", en: "Elbow depth", it: "Altezza gomito", unit: "mm" },
      { key: "wristScope", en: "Wrist circumference", it: "Circonferenza polso", unit: "mm" },
    ],
  },
  {
    en: "Waist & hips",
    it: "Vita e fianchi",
    fields: [
      { key: "waistScope", en: "Waist circumference", it: "Circonferenza vita", unit: "mm" },
      { key: "waistHeight", en: "Waist height", it: "Altezza vita", unit: "mm" },
      { key: "hipScope", en: "Hip circumference", it: "Circonferenza fianchi", unit: "mm" },
      { key: "hipDepth", en: "Hip depth", it: "Altezza fianchi", unit: "mm" },
      { key: "pantsHipScope", en: "Trouser hip circumference", it: "Circonferenza fianchi pantalone", unit: "mm" },
      { key: "pantsHipDepth", en: "Trouser hip depth", it: "Altezza fianchi pantalone", unit: "mm" },
      { key: "sittingHeight", en: "Sitting height", it: "Altezza seduta", unit: "mm" },
      { key: "buttocksAngle", en: "Buttocks angle", it: "Angolo glutei", unit: "°" },
    ],
  },
  {
    en: "Legs",
    it: "Gambe",
    fields: [
      { key: "thighScope", en: "Thigh circumference", it: "Circonferenza coscia", unit: "mm" },
      { key: "kneeScope", en: "Knee circumference", it: "Circonferenza ginocchio", unit: "mm" },
      { key: "kneeDepth", en: "Knee height", it: "Altezza ginocchio", unit: "mm" },
      { key: "ankleScope", en: "Ankle circumference", it: "Circonferenza caviglia", unit: "mm" },
    ],
  },
];

export const MEASUREMENT_FIELDS: MeasurementField[] = MEASUREMENT_GROUPS.flatMap((g) => g.fields);

export async function fetchMeasurements(): Promise<MeasurementRecord | null> {
  const { data, error } = await supabase.from("body_measurements").select("*").maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, values: (data.values ?? {}) as MeasurementValues } as MeasurementRecord;
}

export async function saveMeasurements(values: MeasurementValues, type = "complete") {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Not authenticated");
  const { error } = await supabase
    .from("body_measurements")
    .upsert({ user_id: userData.user.id, values, type }, { onConflict: "user_id" });
  if (error) throw error;
}
