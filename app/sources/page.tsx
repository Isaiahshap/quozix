"use client";

import { motion } from "framer-motion";
import {
  Info,
  Database,
  Tv2,
  Radio,
  Globe,
  Plane,
  Shield,
  AlertTriangle,
  Mail,
  ExternalLink,
  Lock,
  Heart,
  Keyboard,
} from "lucide-react";
import { Panel, PanelHeader } from "@/components/UI/Panel";
import { Badge } from "@/components/UI/Badge";

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const DATA_SOURCES = [
  {
    id: "gdelt",
    name: "GDELT Project",
    icon: Database,
    url: "https://www.gdeltproject.org/",
    type: "Signals / News Mentions",
    description:
      "GDELT (Global Database of Events, Language, and Tone) monitors news media worldwide. The DOC 2.1 API is publicly available without an API key. Data reflects news mentions — not independently verified events.",
    license: "Open / Public Domain",
    limitations: "Data may be delayed, incomplete, or inaccurate. Locations are inferred from text.",
  },
  {
    id: "iptv",
    name: "IPTV-Org",
    icon: Tv2,
    url: "https://github.com/iptv-org/iptv",
    type: "Live TV Stream Directory",
    description:
      "A community-maintained collection of publicly available IPTV channel URLs. Quozix reads the M3U playlist index and presents it as a directory. No streams are hosted by Quozix.",
    license: "Unlicense (public domain)",
    limitations: "Stream availability depends entirely on third-party broadcasters. Streams may break or go offline at any time.",
  },
  {
    id: "radiobrowser",
    name: "Radio Browser",
    icon: Radio,
    url: "https://www.radio-browser.info/",
    type: "Radio Station Directory",
    description:
      "A free, open-source, community radio station database with no API key required. Quozix searches their public REST API to find stations.",
    license: "Public API, CC0 data",
    limitations: "Stream quality varies. CORS restrictions may require fallback to curated list.",
  },
  {
    id: "opensky",
    name: "OpenSky Network",
    icon: Plane,
    url: "https://opensky-network.org/",
    type: "ADS-B Air Activity (Optional)",
    description:
      "OpenSky provides a public REST API for ADS-B flight data. The anonymous endpoint is rate-limited and may not be CORS-accessible in all browsers. When unavailable, a curated sample is shown.",
    license: "CC BY-NC-SA 4.0 (non-commercial)",
    limitations: "Coverage is incomplete. Not suitable for aviation navigation or safety use.",
  },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Open command palette" },
  { keys: ["↑", "↓"], desc: "Navigate command palette" },
  { keys: ["↵"], desc: "Select in command palette" },
  { keys: ["Esc"], desc: "Close modal / palette" },
];

export default function SourcesPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-0.5 bg-[#00d4ff]" />
          <span className="text-xs font-semibold font-heading tracking-widest text-[#00d4ff] uppercase">
            Transparency
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#e2e8f0]">
          Sources & Terms
        </h1>
        <p className="text-sm text-[#475569] font-body mt-1.5 max-w-xl">
          How Quozix works, where data comes from, and what you should know before using it.
        </p>
      </motion.div>

      {/* How it works */}
      <motion.div
        custom={0}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Panel>
          <PanelHeader title="How Quozix Works" icon={<Info className="w-4 h-4" />} />
          <div className="p-4 space-y-3 text-sm text-[#94a3b8] font-body leading-relaxed">
            <p>
              Quozix is a <strong className="text-[#e2e8f0]">zero-backend, entirely client-side</strong> web application.
              It makes GET requests directly from your browser to public APIs and stream directories.
              There is no server, no database, no authentication, and no data is stored except
              your favorites in your browser&apos;s localStorage.
            </p>
            <p>
              All data is fetched on demand and cached locally for performance. Cached data expires
              after set intervals (signals: 10 min, radio: 1h, IPTV: 24h).
            </p>
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[#00d4ff]/5 border border-[#00d4ff]/10">
              <Lock className="w-3.5 h-3.5 text-[#00d4ff] flex-shrink-0 mt-0.5" />
              <p className="text-xs">
                <strong className="text-[#00d4ff]">Privacy:</strong> Quozix does not collect any personal data.
                No analytics, no tracking. Your favorites are stored only in your own browser.
              </p>
            </div>
          </div>
        </Panel>
      </motion.div>

      {/* Data Sources */}
      <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
        <Panel>
          <PanelHeader title="Data Sources" icon={<Database className="w-4 h-4" />} subtitle="All data comes from publicly accessible third-party APIs" />
          <div className="divide-y divide-[#1e2433]">
            {DATA_SOURCES.map((source) => {
              const Icon = source.icon;
              return (
                <div key={source.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1e2433] border border-[#2a3347] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#94a3b8]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold font-heading text-[#e2e8f0] hover:text-[#00d4ff] transition-colors flex items-center gap-1"
                        >
                          {source.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Badge variant="ghost" size="xs">{source.type}</Badge>
                      </div>
                      <p className="text-[10px] text-[#475569]">License: {source.license}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8] font-body leading-relaxed">{source.description}</p>
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[#475569] font-body">{source.limitations}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </motion.div>

      {/* Content disclaimer */}
      <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
        <Panel glow="none">
          <PanelHeader title="Content Disclaimer" icon={<Shield className="w-4 h-4" />} />
          <div className="p-4 space-y-3 text-sm text-[#94a3b8] font-body leading-relaxed">
            <p>
              <strong className="text-[#e2e8f0]">Quozix does not host any video or audio streams.</strong>{" "}
              All streams are linked from third-party sources (iptv-org directory, Radio Browser).
              Stream availability, quality, and legality depends entirely on the original broadcaster.
            </p>
            <p>
              If you believe a stream link should be removed, please raise an issue on the
              relevant upstream project (iptv-org or Radio Browser). Quozix has no editorial
              control over the stream directory contents.
            </p>
            <p>
              <strong className="text-[#e2e8f0]">News signal data</strong> (from GDELT) reflects
              raw news mentions aggregated from media. Quozix does not editorialize or verify these
              signals. Labels like &ldquo;Reported&rdquo; or &ldquo;Multiple Sources&rdquo; indicate source diversity,
              not factual confirmation.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Mail className="w-4 h-4 text-[#00d4ff] flex-shrink-0" />
              <a
                href="mailto:report@quozix.app?subject=Report%20broken%20or%20inappropriate%20link"
                className="text-[#00d4ff] hover:underline text-sm"
              >
                Report a broken or inappropriate link →
              </a>
            </div>
          </div>
        </Panel>
      </motion.div>

      {/* Ethics & Safety */}
      <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
        <Panel>
          <PanelHeader title="Ethics & Safety" icon={<AlertTriangle className="w-4 h-4" />} />
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  title: "No Real-Time Targeting",
                  desc: "Quozix is not designed for, and should not be used for, real-time targeting of individuals, groups, or locations.",
                  color: "red" as const,
                },
                {
                  title: "Data Is Imperfect",
                  desc: "All data on this platform may be incomplete, delayed, or inaccurate. GDELT signals are news mentions — not confirmed facts.",
                  color: "amber" as const,
                },
                {
                  title: "Not for Safety Decisions",
                  desc: "Do not rely on Quozix for safety-critical decisions. Always use official, verified sources for emergency situations.",
                  color: "amber" as const,
                },
                {
                  title: "Approximate Locations",
                  desc: "Geographic coordinates displayed are approximate inferences from text keywords — not verified GPS positions.",
                  color: "ghost" as const,
                },
              ].map(({ title, desc, color }) => (
                <div
                  key={title}
                  className="px-3 py-3 rounded-xl bg-[#12141a] border border-[#1e2433] space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={color} size="xs" dot>{title}</Badge>
                  </div>
                  <p className="text-xs text-[#475569] font-body leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </motion.div>

      {/* Keyboard shortcuts */}
      <motion.div custom={4} variants={itemVariants} initial="hidden" animate="visible">
        <Panel>
          <PanelHeader title="Keyboard Shortcuts" icon={<Keyboard className="w-4 h-4" />} />
          <div className="p-4">
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.map(({ keys, desc }) => (
                <div key={desc} className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {keys.map((key) => (
                      <kbd
                        key={key}
                        className="px-1.5 py-0.5 bg-[#1e2433] border border-[#2a3347] rounded text-xs font-mono text-[#94a3b8]"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-sm text-[#94a3b8] font-body">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </motion.div>

      {/* Credits */}
      <motion.div custom={5} variants={itemVariants} initial="hidden" animate="visible">
        <div className="text-center py-4 space-y-1">
          <p className="text-xs text-[#475569] font-body">
            Built with{" "}
            <Heart className="w-3 h-3 inline text-[#ef4444]" />{" "}
            using Next.js, Tailwind CSS, Framer Motion, globe.gl, hls.js
          </p>
          <p className="text-xs text-[#1e2433] font-body">
            Quozix v1.0 · Open source · No backend · No tracking
          </p>
        </div>
      </motion.div>
    </div>
  );
}
