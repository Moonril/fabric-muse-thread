import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "project-images";

export type ProjectStatus = "active" | "completed";

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reference_image_url: string | null;
  fabric_image_url: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  sort_order: number;
};

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchProject(id: string) {
  const [projectRes, imagesRes] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
  ]);
  if (projectRes.error) throw projectRes.error;
  if (imagesRes.error) throw imagesRes.error;
  return {
    project: (projectRes.data as Project | null) ?? null,
    images: (imagesRes.data ?? []) as ProjectImage[],
  };
}

export async function uploadImage(file: File): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Not authenticated");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userData.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function signedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

function isStoragePath(value: string) {
  return !/^https?:\/\//i.test(value);
}

export async function removeImage(path: string | null | undefined) {
  if (!path || !isStoragePath(path)) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export type ProjectInput = {
  title: string;
  description: string | null;
  referencePath: string | null;
  fabricPath: string | null;
  extraPaths: string[];
  status: ProjectStatus;
};

export async function createProject(input: ProjectInput): Promise<Project> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userData.user.id,
      title: input.title,
      description: input.description,
      reference_image_url: input.referencePath,
      fabric_image_url: input.fabricPath,
      status: input.status,
    })
    .select("*")
    .single();
  if (error) throw error;

  await syncExtraImages(data.id, input.extraPaths);
  return data as Project;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update({
      title: input.title,
      description: input.description,
      reference_image_url: input.referencePath,
      fabric_image_url: input.fabricPath,
      status: input.status,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;

  await syncExtraImages(id, input.extraPaths);
  return data as Project;
}

async function syncExtraImages(projectId: string, paths: string[]) {
  const { error: delError } = await supabase.from("project_images").delete().eq("project_id", projectId);
  if (delError) throw delError;
  if (paths.length === 0) return;
  const { error } = await supabase.from("project_images").insert(
    paths.slice(0, 5).map((image_url, index) => ({
      project_id: projectId,
      image_url,
      sort_order: index,
    })),
  );
  if (error) throw error;
}

export async function setProjectStatus(id: string, status: ProjectStatus) {
  const { error } = await supabase.from("projects").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(project: Project, images: ProjectImage[]) {
  const paths = [project.reference_image_url, project.fabric_image_url, ...images.map((i) => i.image_url)].filter(
    (p): p is string => Boolean(p) && isStoragePath(p as string),
  );
  const { error } = await supabase.from("projects").delete().eq("id", project.id);
  if (error) throw error;
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}