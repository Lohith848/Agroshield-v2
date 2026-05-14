import { useState, useRef } from "react";
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

export default function Scanner() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // 1. Try Plant.id API via our proxy
      const response = await axios.post("/api/scan", {
        image: image,
      });

      const data = response.data;

      if (data.result?.is_plant?.probability > 0.6) {
        const isHealthy = data.result.is_healthy?.probability > 0.7;
        const healthDetermination = data.result.disease_determination;
        const suggestions = healthDetermination?.suggestions || [];

        let report = `Status: ${isHealthy ? "Healthy" : "Infected"}\n\n`;
        report += `Common Name: ${data.result.classification?.suggestions?.[0]?.name || "Unknown Plant"}\n\n`;

        if (suggestions.length > 0) {
          report += `Top Detection: ${suggestions[0].name} (${Math.round(suggestions[0].probability * 100)}% confidence)\n\n`;

          if (suggestions[0].details?.description) {
            report += `Description: ${suggestions[0].details.description}\n\n`;
          }

          if (suggestions[0].details?.treatment) {
            const treatment = suggestions[0].details.treatment;
            report += `Treatment:\n`;
            if (treatment.biological) report += `• Biological: ${treatment.biological.join(", ")}\n`;
            if (treatment.chemical) report += `• Chemical: ${treatment.chemical.join(", ")}\n`;
            if (treatment.prevention) report += `• Prevention: ${treatment.prevention.join(", ")}\n`;
          }
        }

        setResult(report);
      } else {
        // Fallback to Claude if it's not detected as a plant by Plant.id
        await analyzeWithClaude();
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError(err.response.data.setupInstructions || "PlantID API key missing. Check configuration.");
      } else {
        // Try Claude as total fallback
        await analyzeWithClaude();
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithClaude = async () => {
    try {
      const response = await axios.post("/api/claude-analyze", {
        image: image,
      });

      const data = response.data;
      if (data.result) {
        setResult(data.result);
      } else {
        throw new Error("No result from Claude");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError(err.response.data.setupInstructions || "Anthropic API key missing. Check your .env file.");
      } else {
        setError("Analysis failed. Both Plant.id and Claude APIs are unavailable.");
      }
    }
  };

  return (
    <div className="px-6 pt-8 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Agro Scanner</h1>
        <p className="text-gray-500 text-sm">Scan your crops to detect diseases and get instant solutions.</p>
      </div>

      {/* Image Preview / Upload Area */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-6">
        <AnimatePresence mode="wait">
          {image ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <img src={image} alt="Crop" className="w-full h-full object-cover" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center p-8"
            >
              <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-green-600">
                <Camera size={32} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Take a photo</p>
                <p className="text-xs text-gray-400 mt-1">Focus on the leaves or affected area</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm font-medium text-green-600 underline"
              >
                or upload from gallery
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        {!result && image && (
          <button
            disabled={loading}
            onClick={analyzeImage}
            className="w-full h-14 bg-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <CheckCircle2 />}
            {loading ? "Analyzing..." : "Start Analysis"}
          </button>
        )}

        {!image && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-14 bg-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 active:scale-95 transition-all"
          >
            <Camera />
            Open Camera
          </button>
        )}

        {result && (
          <button
            onClick={() => { setImage(null); setResult(null); }}
            className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <RefreshCw />
            Scan Another Crop
          </button>
        )}
      </div>

      {/* Analysis Result */}
      <AnimatePresence>
        {loading && !result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <RefreshCw className="animate-spin text-green-600" size={18} />
              </div>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15 }}
                  className="h-full bg-green-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center italic">Consulting AI Knowledge Base...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-start"
          >
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="p-6 bg-green-50/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-green-600 rounded-full" />
                Detection Result
              </h3>
              <div className="prose prose-green prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {result}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
