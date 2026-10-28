import React from 'react';

export default function LaboratoryMascot() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '200px' }}>
      <svg
        viewBox="0 0 240 220"
        width="200"
        height="185"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Microscope Barrel Gradient */}
          <linearGradient id="labBarrelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#1e80f5" />
            <stop offset="100%" stopColor="#0b54d1" />
          </linearGradient>

          {/* Test Tube Liquid Gradient */}
          <linearGradient id="labLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* C-Arm Frame Soft Sky Blue Gradient */}
          <linearGradient id="labArmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#c5e0fd" />
          </linearGradient>
        </defs>

        {/* Ambient Bubbles & Particles */}
        <circle cx="46" cy="118" r="4.5" fill="#bfdbfe" opacity="0.6" />
        <circle cx="36" cy="82" r="3" fill="#bfdbfe" opacity="0.6" />
        <circle cx="70" cy="54" r="4" fill="#bfdbfe" opacity="0.6" />
        <circle cx="172" cy="62" r="3.5" fill="#bfdbfe" opacity="0.65" />
        
        {/* Diamond Sparkle top right */}
        <path
          d="M 194 54 Q 194 60 200 60 Q 194 60 194 66 Q 194 60 188 60 Q 194 60 194 54 Z"
          fill="#93c5fd"
        />

        {/* Angled Light Beam Under Stage */}
        <polygon points="68,122 106,122 116,149 56,149" fill="#ffffff" opacity="0.8" />

        {/* Stage Platform */}
        <rect x="62" y="118" width="50" height="6" rx="3" fill="#ffffff" stroke="#a5cffd" strokeWidth="1.6" />
        <rect x="70" y="115" width="16" height="3" rx="1.5" fill="#3b82f6" />

        {/* C-Shaped Curved Arm Frame */}
        <path
          d="M 94 148 C 140 148 154 106 126 74 C 117 64 104 65 98 72 C 94 77 98 84 105 87 C 122 92 126 120 104 141 Z"
          fill="url(#labArmGrad)"
          stroke="#9ec5fd"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Focus Adjustment Knobs */}
        {/* Joint Knob */}
        <circle cx="120" cy="74" r="8" fill="#8ec1fd" stroke="#1e7df0" strokeWidth="2" />
        <circle cx="120" cy="74" r="3.5" fill="#ffffff" />
        {/* Lower Fine Focus Knob */}
        <circle cx="122" cy="128" r="4.5" fill="#8ec1fd" stroke="#1e7df0" strokeWidth="1.5" />

        {/* Angled Microscope Tube (Rotated ~42 deg) */}
        <g transform="translate(100, 68) rotate(-42)">
          {/* Eyepiece Cap */}
          <rect x="-11" y="-58" width="22" height="8" rx="4" fill="#0066fe" />
          {/* Eyepiece Tube Collar */}
          <rect x="-8" y="-50" width="16" height="8" fill="#38bdf8" />
          {/* Ring Collar */}
          <rect x="-12" y="-42" width="24" height="4" rx="2" fill="#004bb5" />
          
          {/* Main Body Barrel */}
          <rect x="-14" y="-38" width="28" height="38" rx="5" fill="url(#labBarrelGrad)" />
          {/* Highlight Stripe */}
          <rect x="-11" y="-34" width="5.5" height="30" rx="2.5" fill="#ffffff" opacity="0.5" />
          {/* Lower Collar */}
          <rect x="-15" y="0" width="30" height="5" rx="2.5" fill="#004bb5" />
          
          {/* Revolving Nosepiece Turret */}
          <rect x="-11" y="6" width="22" height="9" rx="3.5" fill="#1e40af" />
          {/* Objective Lens */}
          <rect x="-7" y="15" width="14" height="11" rx="2.5" fill="#0066fe" />
          {/* Lens Tip Highlight */}
          <rect x="-5" y="26" width="10" height="3.5" rx="1" fill="#38bdf8" />
        </g>

        {/* Microscope Base Platform */}
        {/* Upper soft tier */}
        <rect x="48" y="145" width="102" height="7" rx="3.5" fill="#e0edfc" stroke="#b9d8fd" strokeWidth="1.2" />
        {/* Lower Sturdy Ground Pill Bar */}
        <rect x="42" y="152" width="114" height="10" rx="5" fill="#0b54d1" />

        {/* Test Tube on Right */}
        <g transform="translate(166, 88)">
          {/* Flange Rim */}
          <rect x="-3" y="0" width="26" height="5.5" rx="2.5" fill="#0052cc" />
          {/* Tube Outer Glass */}
          <path
            d="M 0 5.5 L 0 50 A 10 10 0 0 0 20 50 L 20 5.5 Z"
            fill="#ffffff"
            stroke="#0052cc"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Liquid */}
          <path
            d="M 2.5 26 L 2.5 50 A 7.5 7.5 0 0 0 17.5 50 L 17.5 26 Z"
            fill="url(#labLiquidGrad)"
          />
          {/* Meniscus */}
          <ellipse cx="10" cy="26" rx="7.5" ry="2" fill="#38bdf8" />
          {/* Bubble */}
          <circle cx="7.5" cy="42" r="1.8" fill="#ffffff" opacity="0.8" />
        </g>

        {/* Text: Precision in Testing / Care in Every Detail */}
        <text
          x="120"
          y="188"
          textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          fontSize="14.5"
          fontWeight="700"
          fill="#2b487e"
          letterSpacing="-0.015em"
        >
          Precision in Testing
        </text>
        <text
          x="120"
          y="208"
          textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          fontSize="14.5"
          fontWeight="700"
          fill="#2b487e"
          letterSpacing="-0.015em"
        >
          Care in Every Detail
        </text>
      </svg>
    </div>
  );
}
