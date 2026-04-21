import { motion } from "framer-motion";

export default function AnimatedButton({ 
  onClick, 
  loading = false, 
  children,
  disabled = false,
  className = "",
  variant = "primary"
}) {
  const baseClasses = "rounded-lg px-4 py-2 text-white font-medium transition-all duration-200";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
    success: "bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed",
    danger: "bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={loading || disabled}
      whileHover={{ scale: loading || disabled ? 1 : 1.02 }}
      whileTap={{ scale: loading || disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
          Loading...
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
}
