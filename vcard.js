// Module 2 : génère un fichier .vcf (vCard 3.0) et branche le bouton « Ajouter aux contacts ».
// Aucune donnée n'est envoyée nulle part : tout se fait dans le navigateur.

function echapper(t) {
  return String(t).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function construireVcard(o) {
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
  l.push('END:VCARD');
  return l.join('\r\n');
}

function initAjout(o) {
  const bouton = document.getElementById('ajout');
  bouton.hidden = false;
  bouton.onclick = () => {
    const blob = new Blob([construireVcard(o)], { type: 'text/vcard;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = o.id + '.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
}
