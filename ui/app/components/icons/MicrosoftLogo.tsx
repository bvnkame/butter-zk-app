
import React from 'react';

const MicrosoftLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" {...props}>
    <path d="M1 1h9v9H1V1z" fill="#f25022" />
    <path d="M11 1h9v9h-9V1z" fill="#7fba00" />
    <path d="M1 11h9v9H1v-9z" fill="#00a4ef" />
    <path d="M11 11h9v9h-9v-9z" fill="#ffb900" />
  </svg>
);

export default MicrosoftLogo;
