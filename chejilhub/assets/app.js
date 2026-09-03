
document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('.nav');
  const navToggle=document.querySelector('[data-nav-toggle]');
  const closeNav=()=>{if(!nav||!navToggle)return;nav.dataset.open='false';navToggle.setAttribute('aria-expanded','false')};
  navToggle?.addEventListener('click',()=>{const open=nav?.dataset.open!=='true';if(nav)nav.dataset.open=String(open);navToggle.setAttribute('aria-expanded',String(open))});
  document.querySelectorAll('.nav__menu a').forEach(link=>link.addEventListener('click',closeNav));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNav()});

  const q=document.querySelector('[data-search]');
  const c=document.querySelector('[data-collection]');
  const s=document.querySelector('[data-status]');
  const rows=[...document.querySelectorAll('[data-row]')];
  const count=document.querySelector('[data-count]');
  const filter=()=>{
    const term=(q?.value||'').trim().toLowerCase();
    const collection=c?.value||'';
    const status=s?.value||'';
    let shown=0;
    rows.forEach(row=>{
      const ok=(!term||row.dataset.text.includes(term))&&(!collection||row.dataset.collection===collection)&&(!status||row.dataset.status===status);
      row.hidden=!ok;
      if(ok)shown++;
    });
    if(count)count.textContent=shown.toLocaleString();
  };
  if(q){const term=new URLSearchParams(location.search).get('q');if(term)q.value=term}
  q?.addEventListener('input',filter);c?.addEventListener('change',filter);s?.addEventListener('change',filter);filter();

  const keywordDetails=[...document.querySelectorAll('.field-keyword')];
  keywordDetails.forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)keywordDetails.forEach(other=>{if(other!==detail)other.open=false})}));
  document.addEventListener('click',event=>{if(!event.target.closest('.field-keyword'))keywordDetails.forEach(detail=>detail.open=false)});

  document.querySelectorAll('[data-contact-form]').forEach(form=>{
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      const status=form.querySelector('[data-form-status]');
      const button=form.querySelector('button[type="submit"]');
      const data=new FormData(form);
      if(data.get('website'))return;
      const payload={
        type:'contact',
        name:String(data.get('name')||''),
        email:String(data.get('email')||''),
        phone:String(data.get('phone')||''),
        organization:String(data.get('organization')||''),
        topic:String(data.get('topic')||''),
        message:String(data.get('message')||''),
        fileName:`사상체질 허브 문의 | ${data.get('phone')||'-'} | ${data.get('topic')||'-'} | ${data.get('message')||'-'}`,
        referer:location.href,
        userAgent:navigator.userAgent
      };
      if(status)status.textContent='문의 내용을 전송하고 있습니다.';
      if(button)button.disabled=true;
      try{
        await fetch(form.dataset.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
        form.reset();
        if(status)status.textContent='문의가 접수되었습니다. 확인 후 이메일 또는 전화로 연락드리겠습니다.';
      }catch(error){
        if(status)status.innerHTML='전송이 원활하지 않습니다. <a href="mailto:ryujean77@gmail.com">ryujean77@gmail.com</a>으로 보내 주세요.';
      }finally{if(button)button.disabled=false}
    });
  });
});
