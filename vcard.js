// Module 2 : génère un fichier .vcf (vCard 3.0) et branche le bouton « Ajouter aux contacts ».
// Aucune donnée n'est envoyée nulle part : tout se fait dans le navigateur.

function echapper(t) {
  return String(t).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function construireVcard(o, photoB64) {
  const l = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:' + echapper(o.nom) + ';' + echapper(o.prenom) + ';;;',
    'FN:' + echapper(o.prenom + ' ' + o.nom),
    'ORG:' + echapper(o.organisation),
    'TITLE:' + echapper(o.fonction || ''),
  ];
  if (o.tel)   l.push('TEL;TYPE=CELL:' + o.tel.replace(/\s/g, ''));
  if (o.email) l.push('EMAIL;TYPE=INTERNET:' + o.email);
  if (o.emailPerso) l.push('EMAIL;TYPE=INTERNET,HOME:' + o.emailPerso);
  if (o.site)  l.push('URL:' + o.site);
  if (photoB64) l.push(plier('PHOTO;ENCODING=b;TYPE=JPEG:' + photoB64));
  l.push('END:VCARD');
  return l.join('\r\n');
}

// Lignes de 75 caractères maximum : la suite commence par une espace (norme vCard).
function plier(ligne) {
  const p = [ligne.slice(0, 75)];
  for (let i = 75; i < ligne.length; i += 74) p.push(' ' + ligne.slice(i, i + 74));
  return p.join('\r\n');
}

// Charge la photo de la carte, la réduit (256 px) et la renvoie en base64 JPEG. Vide si impossible.
async function photoEnBase64(url) {
  if (!url) return '';
  try {
    const blob = await (await fetch(url)).blob();
    const img = await createImageBitmap(blob);
    const k = Math.min(1, 256 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85).split(',')[1] || '';
  } catch (e) { return ''; } // sans photo, le contact s'enregistre quand même
}

function initAjout(o) {
  const bouton = document.getElementById('ajout');
  bouton.hidden = false;
  bouton.onclick = async () => {
    const photo = await photoEnBase64(o.photo);
    const blob = new Blob([construireVcard(o, photo)], { type: 'text/vcard;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = o.id + '.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
}
