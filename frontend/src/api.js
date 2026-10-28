const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export function getToken(){ return localStorage.getItem('worksphere_token'); }
export async function request(path, options={}){
  const headers={...(options.headers||{})};
  if (!(options.body instanceof FormData) && options.body) headers['Content-Type']='application/json';
  if (getToken()) headers.Authorization=`Bearer ${getToken()}`;
  const response=await fetch(`${API}${path}`,{...options,headers});
  if(!response.ok){let msg=`Request failed (${response.status})`;try{const d=await response.json();msg=d.detail||msg}catch{};throw new Error(typeof msg==='string'?msg:JSON.stringify(msg));}
  if(response.status===204)return null;
  const type=response.headers.get('content-type')||'';
  return type.includes('application/json')?response.json():response.text();
}
export async function login(username_or_email, password) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username_or_email,
      password,
    }),
  });

  localStorage.setItem('worksphere_token', result.access_token);

  if (result.user) {
    localStorage.setItem(
      'worksphere_user',
      JSON.stringify(result.user)
    );
  }

  return result;
}
