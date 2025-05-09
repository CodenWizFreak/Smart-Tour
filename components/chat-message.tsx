import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type Message = {
  role: "user" | "assistant"
  content: string
}

interface ChatMessageProps {
  message: Message
}

// Add this function before the ChatMessage component
function formatMessageContent(content: string): string {
  // First, escape any HTML to prevent XSS
  let formattedContent = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

  // Replace <strong> tags with actual bold styling
  formattedContent = formattedContent.replace(/&lt;strong&gt;([^&]+)&lt;\/strong&gt;/g, "<b>$1</b>")

  // Replace ** with bold tags
  formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")

  // Replace • at the beginning of lines with proper bullet points
  formattedContent = formattedContent.replace(/^• (.+)$/gm, "<li style='margin-bottom: 8px;'>$1</li>")

  // Also handle asterisk bullet points
  formattedContent = formattedContent.replace(/^\* (.+)$/gm, "<li style='margin-bottom: 8px;'>$1</li>")

  // Wrap lists in ul tags
  if (formattedContent.includes("<li")) {
    formattedContent = formattedContent.replace(
      /(<li[^>]*>.*?<\/li>)+/gs,
      "<ul style='margin: 8px 0; padding-left: 20px;'>$&</ul>",
    )
  }

  // Convert line breaks to <br> tags
  formattedContent = formattedContent.replace(/\n/g, "<br>")

  return formattedContent
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 border border-secondary/50 shadow-sm shadow-secondary/20">
          <AvatarImage src="/images/logo-compass.png" alt="AI" />
          <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "rounded-lg p-4 max-w-[80%] border",
          isUser ? "bg-primary/10 text-foreground border-primary/20" : "bg-muted/30 border-white/10 backdrop-blur-sm",
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-line">{message.content}</div>
        ) : (
          <div
            className="whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
          />
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 border border-primary/50 shadow-sm shadow-primary/20">
          <AvatarImage src="/images/profile-user-icon.png" alt="You" />
          <AvatarFallback className="bg-secondary/20 text-secondary">You</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
