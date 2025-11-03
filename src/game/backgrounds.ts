/**
 * Carrega dinamicamente todos os backgrounds disponíveis
 */

// Importa todos os arquivos da pasta bg-assets usando import.meta.glob do Vite
const bgModules = import.meta.glob("../../public/bg-assets/*", {
  eager: true,
  as: "url",
});

// Extrai apenas os URLs dos backgrounds
export const backgrounds: string[] = Object.values(bgModules).map((path) => {
  // Remove o prefixo /public e retorna o path que o Vite vai servir
  return path.replace("/public", "");
});

/**
 * Verifica se o arquivo é um vídeo baseado na extensão
 */
export function isVideo(url: string): boolean {
  const videoExtensions = [".mp4", ".webm", ".ogg"];
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
}

/**
 * Obtém um background aleatório
 */
export function getRandomBackground(): string {
  return backgrounds[Math.floor(Math.random() * backgrounds.length)];
}

/**
 * Obtém um background por índice (com wrap-around)
 */
export function getBackgroundByIndex(index: number): string {
  return (
    backgrounds[index % backgrounds.length] ??
    "https://i.pinimg.com/736x/5d/22/cb/5d22cbbaf3cd689020ad795f14092cd3.jpg"
  );
}

/**
 * Total de backgrounds disponíveis
 */
export const totalBackgrounds = backgrounds.length;
