import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CATEGORIAS, getRandomIdForCategoria } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Search, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const colors = [
  "bg-[#F7C1E1] dark:bg-[#F7C1E1]/80 text-black dark:text-black", // Rosa
  "bg-[#2D8C3C] dark:bg-[#2D8C3C]/80 text-white", // Verde
  "bg-[#007AFF] dark:bg-[#007AFF]/80 text-white", // Azul
  "bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700", // Branco
  "bg-[#FFCC00] dark:bg-[#FFCC00]/80 text-black", // Amarelo
  "bg-[#FF3B30] dark:bg-[#FF3B30]/80 text-white", // Vermelho
  "bg-[#5856D6] dark:bg-[#5856D6]/80 text-white", // Indigo
  "bg-[#AF52DE] dark:bg-[#AF52DE]/80 text-white", // Roxo
  "bg-[#FF9500] dark:bg-[#FF9500]/80 text-white", // Laranja
];

function HomePage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  const filteredCategorias = CATEGORIAS.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col transition-colors duration-500">
      <header className="p-6 pt-12 flex flex-col gap-4 shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-base font-bold tracking-[0.4em] text-foreground uppercase"
          >
            RESSOA
          </motion.h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-muted transition-colors active:scale-90"
              title="Trocar tema"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => navigate({ to: "/onboarding" })}
              className="p-2 rounded-full hover:bg-muted transition-colors active:scale-90"
              title="Voltar ao início"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-black tracking-tight text-foreground uppercase italic"
          >
            Como você se sente?
          </motion.h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Buscar sentimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {filteredCategorias.map((sentimento, index) => {
            const colorClass = colors[index % colors.length];
            const rotation = index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]";
            
            return (
              <motion.div
                key={sentimento}
                variants={itemVariants}
                whileHover={{ scale: 1.02, rotate: 0 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Link
                  to="/mensagem/$sentimento"
                  params={{ sentimento }}
                  search={{ 
                    color: colorClass.split(' ')[0].replace('bg-[', '').replace(']', ''),
                    id: getRandomIdForCategoria(sentimento)
                  }}
                  className={`group relative flex items-center justify-between min-h-[120px] px-8 py-4 transition-all rounded-[32px] overflow-hidden ${colorClass} ${rotation} shadow-sm`}
                >
                  <div className="flex flex-col z-10">
                    <span className="text-3xl font-black leading-none tracking-tighter max-w-[220px] break-words uppercase italic">
                      {sentimento}
                    </span>
                  </div>
                  
                  <div className="absolute right-6 bottom-4 opacity-30 group-hover:opacity-100 transition-opacity">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                       <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
        
        {filteredCategorias.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            Nenhum sentimento encontrado.
          </div>
        )}
      </section>

      <footer className="py-6 text-center bg-background border-t border-muted/20 shrink-0">
        <a 
          href="https://oonn.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          OONN Creative
        </a>
      </footer>
    </div>
  );
}
