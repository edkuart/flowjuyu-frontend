import { Clock } from "lucide-react";

interface ComingSoonBlockProps {
  title: string;
  description: string;
}

export default function ComingSoonBlock({ title, description }: ComingSoonBlockProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6">
        <Clock className="w-7 h-7 text-orange-400" />
      </div>

      <span className="inline-block px-3 py-1 bg-orange-50 text-orange-500 text-xs font-semibold rounded-full tracking-wide uppercase mb-4">
        Próximamente
      </span>

      <h2 className="text-xl font-semibold text-gray-800 mb-3 max-w-sm">
        {title}
      </h2>

      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}
