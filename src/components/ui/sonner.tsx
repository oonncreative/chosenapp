import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        style: {
          background: "#f1f26c",
          color: "#000000",
          border: "1px solid rgba(0,0,0,0.08)",
        },
        classNames: {
          toast:
            "group toast !bg-[#f1f26c] !text-black !border-black/10 shadow-lg",
          description: "!text-black/70",
          actionButton: "!bg-black !text-white",
          cancelButton: "!bg-black/10 !text-black",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
