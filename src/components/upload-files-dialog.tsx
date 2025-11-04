import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import {
  Upload,
  Trash2,
  File,
  Image,
  Video,
  X,
  Grid3x3,
  List,
} from "lucide-react";
import { useState, useRef } from "react";
import {
  addFile,
  getAllFiles,
  deleteFile,
  clearAllFiles,
  type StoredFile,
  createObjectURL,
} from "@/lib/file-storage";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function UploadFilesDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"upload" | "browse">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Query para buscar todos os arquivos
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["stored-files"],
    queryFn: getAllFiles,
    enabled: isOpen, // Só busca quando o dialog está aberto
  });

  // Mutation para adicionar arquivos
  const addFilesMutation = useMutation({
    mutationFn: async (selectedFiles: FileList) => {
      const validFiles = Array.from(selectedFiles).filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/"),
      );

      if (validFiles.length === 0) {
        throw new Error("Nenhum arquivo válido selecionado");
      }

      for (const file of validFiles) {
        await addFile(file);
      }

      return validFiles.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["stored-files"] });
      toast.success(`${count} arquivo(s) adicionado(s) com sucesso!`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: Error) => {
      if (error.message === "Nenhum arquivo válido selecionado") {
        toast.warning("Por favor, selecione apenas imagens ou vídeos.");
      } else {
        toast.error("Erro ao salvar arquivos. Tente novamente.");
      }
    },
  });

  // Mutation para deletar arquivo
  const deleteFileMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stored-files"] });
      toast.success("Arquivo removido!");
    },
    onError: () => {
      toast.error("Erro ao deletar arquivo.");
    },
  });

  // Mutation para limpar todos os arquivos
  const clearAllMutation = useMutation({
    mutationFn: clearAllFiles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stored-files"] });
      toast.success("Todos os arquivos foram removidos!");
    },
    onError: () => {
      toast.error("Erro ao remover arquivos.");
    },
  });

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    addFilesMutation.mutate(selectedFiles);
  };

  const handleDelete = (id: number) => {
    deleteFileMutation.mutate(id);
  };

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const isProcessing =
    addFilesMutation.isPending ||
    deleteFileMutation.isPending ||
    clearAllMutation.isPending;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4" />
          Arquivos Locais
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Arquivos Locais</DialogTitle>
          <DialogDescription>
            Faça upload de imagens ou vídeos para usar como fundo das cartas. Os
            arquivos são salvos localmente no seu navegador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info sobre quantos arquivos estão salvos */}
          <div className="flex items-center justify-between rounded-lg bg-slate-100 p-2 px-4 dark:bg-slate-800">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Arquivos salvos
              </p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : files.length}
              </p>
            </div>
            <div className="flex gap-2">
              {files.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setViewMode(viewMode === "upload" ? "browse" : "upload")
                    }
                  >
                    {viewMode === "upload" ? (
                      <>
                        <Grid3x3 className="h-4 w-4" />
                        Navegar
                      </>
                    ) : (
                      <>
                        <List className="h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                        Limpar Tudo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Tem certeza que deseja remover TODOS os arquivos?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleClearAll()}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>

          {viewMode === "upload" ? (
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium">
                Arraste arquivos aqui ou clique no botão abaixo
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Imagens (JPG, PNG, GIF, WebP) ou Vídeos (MP4, WebM)
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={isProcessing}
              />

              <Button
                type="button"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4" />
                Selecionar Arquivos
              </Button>
            </div>
          ) : (
            // Browse View - Grid com todos os arquivos
            <div className="">
              {files.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  Nenhum arquivo encontrado
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-4">
                  {files.map((file) => {
                    const objectUrl = createObjectURL(file);
                    return (
                      <div
                        key={file.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-800"
                      >
                        {/* Preview da imagem ou vídeo */}
                        {file.type.startsWith("image/") ? (
                          <img
                            src={objectUrl}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <video
                            src={objectUrl}
                            className="h-full w-full object-cover"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                        )}

                        {/* Overlay com informações e botão de deletar */}
                        <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => file.id && handleDelete(file.id)}
                              disabled={isProcessing}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-white">
                            <p className="truncate text-xs font-medium">
                              {file.name}
                            </p>
                            <p className="text-xs opacity-75">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
