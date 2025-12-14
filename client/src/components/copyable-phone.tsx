import { useState } from "react";
import { Phone, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CopyablePhoneProps {
  phone: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function CopyablePhone({
  phone,
  label,
  className,
  showIcon = true,
}: CopyablePhoneProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      toast({
        title: "Phone number copied!",
        description: phone,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = phone;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        toast({
          title: "Phone number copied!",
          description: phone,
        });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast({
          title: "Failed to copy",
          description: "Please copy manually",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      onTouchEnd={handleCopy}
      className={cn(
        "flex items-center gap-1.5 text-sm text-primary hover:underline",
        "active:scale-95 transition-transform cursor-pointer select-none",
        "touch-manipulation",
        className
      )}
      title="Tap to copy phone number"
    >
      {showIcon && <Phone className="h-3.5 w-3.5 shrink-0" />}
      {label && <span className="text-muted-foreground mr-1">{label}</span>}
      <span className="font-medium">{phone}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500 ml-1" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground ml-1 opacity-60" />
      )}
    </button>
  );
}
