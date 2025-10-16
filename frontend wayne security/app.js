/* app.js - Frontend vanilla JS para Wayne Security */
const API_BASE_URL = "http://127.0.0.1:5000"; // <- ajuste se necessário

// Utils - token storage
function setToken(t){ localStorage.setItem("ws_token", t) }
function getToken(){ return localStorage.getItem("ws_token") }
function clearToken(){ localStorage.removeItem("ws_token") }

// UI helpers
const qs = s => document.querySelector(s)
const qsa = s => document.querySelectorAll(s)
function showView(id){
  qsa(".view").forEach(v => v.classList.add("hidden"))
  qs(`#${id}`).classList.remove("hidden")
  // nav visibility
  if(id === 'loginView') qs("#top-nav").classList.add("hidden")
  else qs("#top-nav").classList.remove("hidden")
}

// Simple fetch wrapper
async function apiFetch(path, opts = {}){
  const headers = opts.headers || {}
  headers['Content-Type'] = 'application/json'
  const token = getToken()
  if(token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(API_BASE_URL + path, {...opts, headers})
  if(res.status === 401 || res.status === 403){
    logout()
    throw new Error('Não autorizado. Faça login novamente.')
  }
  const text = await res.text()
  try { 
    return { status: res.status, data: JSON.parse(text) } 
  } catch(e){ 
    return { status: res.status, data: text } 
  }
}

/* ======= Authentication ======= */
async function loginHandler(e){
  e.preventDefault()
  const username = qs("#username").value.trim()
  const password = qs("#password").value
  try{
    const { status, data } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    })
    if(status === 200 && data.access_token){
      setToken(data.access_token)
      initApp()
    } else {
      alert(data.msg || "Erro ao autenticar")
    }
  }catch(err){
    alert(err.message || "Falha na requisição")
  }
}

function logout(){
  clearToken()
  showView("loginView")
}

/* ======= Dashboard ======= */
async function loadDashboard(){
  try{
    const { status, data } = await apiFetch("/dashboard/summary")
    if(status === 200){
      qs("#totalUsers").textContent = data.total_users
      qs("#totalResources").textContent = data.total_resources
      qs("#devicesOnline").textContent = data.devices_online
      const logsEl = qs("#recentLogs")
      logsEl.innerHTML = ""
      data.recent_access_logs.forEach(l => {
        const row = document.createElement("div")
        row.className = "log-row"
        row.textContent = `${l.timestamp} — usuário:${l.user_id} ação:${l.action} área:${l.area_id}`
        logsEl.appendChild(row)
      })
    } else {
      console.warn("dashboard:", data)
    }
  }catch(err){
    console.error(err)
  }
}

/* ======= Areas ======= */
async function loadAreas(){
  try{
    const { status, data } = await apiFetch("/api/areas")
    if(status === 200){
      const el = qs("#areasList")
      el.innerHTML = ""
      if(data.length===0) el.textContent = "Nenhuma área cadastrada."
      data.forEach(a => {
        const item = document.createElement("div")
        item.className = "item"
        item.innerHTML = `
          <div class="meta">
            <strong>${a.name}</strong>
            <small>${a.code} • ${a.restricted ? "Restrita" : "Aberta"}</small>
          </div>
          <div class="actions">
            <button class="btn" data-action="request" data-id="${a.id}">Solicitar Acesso</button>
          </div>
        `
        el.appendChild(item)
      })
    } else {
      console.warn("areas:", data)
    }
  }catch(err){
    console.error(err)
  }
}

async function createAreaHandler(e){
  e.preventDefault()
  const code = qs("#areaCode").value.trim()
  const name = qs("#areaName").value.trim()
  const restricted = qs("#areaRestricted").value === 'true'
  if(!code || !name) return alert("Código e nome obrigatórios")
  try{
    const { status, data } = await apiFetch("/api/areas", {
      method: "POST",
      body: JSON.stringify({ code, name, restricted })
    })
    if(status === 201){
      qs("#areaCode").value = ""
      qs("#areaName").value = ""
      loadAreas()
    } else {
      alert(data.msg || "Erro ao criar área")
    }
  }catch(err){ alert(err.message) }
}

async function requestAccessHandler(e){
  if(e.target.matches("button[data-action='request']")){
    const id = e.target.dataset.id
    try{
      const { status, data } = await apiFetch(`/api/areas/${id}/request`, { 
        method: "POST", 
        body: JSON.stringify({ note: "Solicitação via frontend" }) 
      })
      if(status === 200) alert("Acesso concedido")
      else if(status === 202) alert("Solicitação registrada - aguardando aprovação")
      else alert(data.msg || "Resposta inesperada")
    }catch(err){ alert(err.message) }
  }
}

/* ======= Resources ======= */
async function loadResources(){
  try{
    const { status, data } = await apiFetch("/api/resources")
    if(status === 200){
      const el = qs("#resourcesList")
      el.innerHTML = ""
      if(data.length === 0) el.textContent = "Nenhum recurso cadastrado."
      data.forEach(r => {
        const item = document.createElement("div")
        item.className = "item"
        item.innerHTML = `
          <div class="meta">
            <strong>${r.name}</strong>
            <small>${r.identifier} • ${r.status} • ${r.location || '—'}</small>
          </div>
        `
        el.appendChild(item)
      })
    } else {
      console.warn("resources:", data)
    }
  }catch(err){ console.error(err) }
}

async function createResourceHandler(e){
  e.preventDefault()
  const identifier = qs("#resourceIdentifier").value.trim()
  const name = qs("#resourceName").value.trim()
  const location = qs("#resourceLocation").value.trim()
  if(!identifier || !name) return alert("Identificador e nome obrigatórios")
  try{
    const { status, data } = await apiFetch("/api/resources", {
      method: "POST",
      body: JSON.stringify({ identifier, name, location })
    })
    if(status === 201){
      qs("#resourceIdentifier").value = ""
      qs("#resourceName").value = ""
      qs("#resourceLocation").value = ""
      loadResources()
    } else {
      alert(data.msg || "Erro ao criar recurso")
    }
  }catch(err){ alert(err.message) }
}

/* ======= Init & Events ======= */
function initEvents(){
  qs("#loginForm").addEventListener("submit", loginHandler)
  qs("#logoutBtn").addEventListener("click", logout)
  qs("#createAreaForm").addEventListener("submit", createAreaHandler)
  qs("#areasList").addEventListener("click", requestAccessHandler)
  qs("#createResourceForm").addEventListener("submit", createResourceHandler)

  // Nav buttons
  qsa(".nav-btn").forEach(b => {
    b.addEventListener("click", ev => {
      const view = ev.target.dataset.view
      if(view) {
        showView(view + "View")
        if(view === 'dashboard') loadDashboard()
        if(view === 'areas') loadAreas()
        if(view === 'resources') loadResources()
      }
    })
  })
}

function isAuthenticated(){
  return !!getToken()
}

function initApp(){
  initEvents()
  if(isAuthenticated()){
    showView("dashboardView")
    loadDashboard()
    qs("#top-nav").classList.remove("hidden")
  } else {
    showView("loginView")
  }
}

// Start
document.addEventListener("DOMContentLoaded", () => {
  initApp()
})
