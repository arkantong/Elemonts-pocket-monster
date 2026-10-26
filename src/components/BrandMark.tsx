/** Pocket Friend route from the user supplied brand identity v2. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="pocket-mark">
    <path d="M12 25C7 5 15 2 25 17M39 17C50 1 58 6 53 27" fill="#F6A58B" stroke="#5D4B7B" strokeWidth="3.5" strokeLinejoin="round"/>
    <path d="M7 36C7 11 57 10 57 36C57 62 7 62 7 36Z" fill="#B8A7FF" stroke="#5D4B7B" strokeWidth="3.5"/>
    <ellipse cx="23" cy="33" rx="4" ry="5" fill="#332A3F"/><ellipse cx="42" cy="33" rx="4" ry="5" fill="#332A3F"/>
    <circle cx="22" cy="31" r="1.5" fill="white"/><circle cx="41" cy="31" r="1.5" fill="white"/>
    <ellipse cx="16" cy="41" rx="4" ry="3" fill="#F6A58B"/><ellipse cx="48" cy="41" rx="4" ry="3" fill="#F6A58B"/>
    <path d="M27 42Q32 49 37 42" stroke="#5D4B7B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>;
}
