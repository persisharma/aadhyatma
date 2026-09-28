// www.vedansh.app → vedansh.app (301), so search engines see one site, not two.
// Netlify did this through its primary-domain setting; Pages needs it in code.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'www.vedansh.app') {
    url.hostname = 'vedansh.app';
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
