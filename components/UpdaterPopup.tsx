import { useEffect, useState } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PackageOpen, Download, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type UpdateStatus =
  | "idle"
  | "downloading"
  | "installing"
  | "completed"
  | "error";

export default function UpdaterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [update, setUpdate] = useState<Update | undefined>(undefined);
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [contentLength, setContentLength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update) {
          setIsVisible(true);
          setUpdate(update);
        }
      } catch (err) {
        console.error("Failed to check for updates:", err);
      }
    };
    checkForUpdates();
  }, []);
  

  const handleUpdate = async () => {
    if (!update) return;

    try {
      setStatus("downloading");
      setProgress(0);
      setDownloaded(0);
      setError(null);

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            setContentLength(event.data.contentLength || 0);
            console.log(
              `started downloading ${event.data.contentLength} bytes`
            );
            break;
          case "Progress":
            setDownloaded((prev) => prev + event.data.chunkLength);
            if (contentLength > 0) {
              const progressPercent = Math.round(
                ((downloaded + event.data.chunkLength) / contentLength) * 100
              );
              setProgress(progressPercent);
            }
            console.log(
              `downloaded ${
                downloaded + event.data.chunkLength
              } from ${contentLength}`
            );
            break;
          case "Finished":
            setStatus("installing");
            console.log("download finished");
            break;
        }
      });

      setStatus("completed");
      console.log("update installed");

      // Give user a moment to see completion status before relaunching
      setTimeout(async () => {
        await relaunch();
      }, 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Update failed");
      console.error("Update failed:", err);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "downloading":
        return <Download className="w-4 h-4 animate-pulse" />;
      case "installing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <PackageOpen className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "downloading":
        return `Downloading update... ${progress}%`;
      case "installing":
        return "Installing update...";
      case "completed":
        return "Update completed! Restarting app...";
      case "error":
        return `Update failed: ${error}`;
      default:
        return "Update Available";
    }
  };

  const getDescription = () => {
    if (status === "error") {
      return error;
    }

    if (status === "downloading") {
      return `Downloading version ${update?.version}...`;
    }

    if (status === "installing") {
      return "Installing the update...";
    }

    if (status === "completed") {
      return "Update installed successfully. The app will restart in a few seconds.";
    }

    return (
      <div>
        A new version of the app is available: <b>{update?.version}</b>
        {update?.body && (
          <div className="mt-2 text-sm text-muted-foreground">
            <strong>What&apos;s new:</strong>
            <div className="mt-1 whitespace-pre-wrap">{update.body}</div>
          </div>
        )}
      </div>
    );
  };

  const isUpdateInProgress =
    status === "downloading" || status === "installing";
  const isCompleted = status === "completed";

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">{getDescription()}</div>
        {status === "downloading" && contentLength > 0 && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((downloaded / 1024 / 1024) * 100) / 100} MB /{" "}
              {Math.round((contentLength / 1024 / 1024) * 100) / 100} MB
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            className="flex w-full"
            onClick={handleUpdate}
            disabled={isUpdateInProgress || isCompleted}
          >
            {isUpdateInProgress ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {status === "downloading" ? "Downloading..." : "Installing..."}
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Restarting...
              </>
            ) : status === "error" ? (
              "Retry Update"
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
