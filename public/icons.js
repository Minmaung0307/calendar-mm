const paths={
 save:'<path d="M5 3h12l4 4v14H3V3ZM7 3v6h10V3M7 21v-8h10v8M13 5v2"/><path d="M9 16h6"/>',
 delete:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',

 full:'<circle cx="12" cy="12" r="8" fill="currentColor" opacity=".22"/><circle cx="12" cy="12" r="8"/><circle cx="9" cy="9" r="1.5" opacity=".6"/><circle cx="15" cy="14" r="2" opacity=".5"/><path d="M7 15h1m7-8h1"/>',
 new:'<circle cx="12" cy="12" r="8" fill="currentColor"/><path d="M7 6a7 7 0 0 1 11 8" stroke="var(--panel)" opacity=".6"/>',
 eve:'<path d="M10.7 6.5C10.7 3.2 11.1 1.3 12 1.3s1.3 1.9 1.3 5.2" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M12 6 10.5 8 10.5 9.3 9 10.1 9.1 11.4 7.6 12.2 7.8 13.6 6.1 14.4 6.3 15.9C4.8 18.2 3.2 19.5 1.8 17.6c-.3 2.5 2.4 4.4 5 4.7h10.4c2.6-.3 5.3-2.2 5-4.7-1.4 1.9-3 .6-4.5-1.7l.2-1.5-1.7-.8.2-1.4-1.5-.8.1-1.3-1.5-.8V8Z" fill="currentColor" stroke="currentColor" stroke-width=".7" stroke-linejoin="round"/><path d="M5 20.2c3.8 1 10.2 1 14 0M12 8.5v9" fill="none" stroke="#fff4c8" stroke-width=".7" opacity=".55"/>',
 sabbath:'<path d="M12 3c-5 5-5 9 0 14 5-5 5-9 0-14Z" fill="currentColor" opacity=".2"/><path d="M12 3c-5 5-5 9 0 14 5-5 5-9 0-14Z"/><path d="M12 18C4 18 2 13 3 8c5 0 8 4 9 10Zm0 0c8 0 10-5 9-10-5 0-8 4-9 10ZM5 21h14"/>',
 festival:'<path d="m3 21 4-13 9 9Z" fill="currentColor" opacity=".2"/><path d="m3 21 4-13 9 9ZM5 15l4 4M10 7l1-4m3 7 5-5m-2 9 4-1M15 3l1 1m4 5 1 1M9 2H8M21 18v2"/><path d="m14 6 1-2 2 1M18 3l2-1m-2 8 3-2"/>',
 holiday:'<path d="m3 9 9-6 9 6H3Zm2 0v10m5-10v10m4-10v10m5-10v10M2 21h20M3 18h18"/>',
 gem:'<path d="M6 4h12l4 6-10 12L2 10Z" fill="currentColor" opacity=".2"/><path d="M6 4h12l4 6-10 12L2 10ZM2 10h20M8 4l-2 6 6 12 6-12-2-6M8 4l4 6 4-6"/>',
 poem:'<path d="M3 5c4-1 6 0 9 2 3-2 5-3 9-2v14c-4-1-6 0-9 2-3-2-5-3-9-2ZM12 7v14M6 9l3 1M6 13l3 1m6-4 3-1m-3 5 3-1"/>',
};
export function icon(name,label=''){const el=document.createElement('span');el.className='symbol symbol-'+name;if(label){el.title=label;el.setAttribute('role','img');el.setAttribute('aria-label',label)}else el.setAttribute('aria-hidden','true');el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.festival}</svg>`;return el;}
