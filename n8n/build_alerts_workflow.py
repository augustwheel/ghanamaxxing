"""Create or update the "Ghanamaxxing — Alerts" workflow on n8n.augustwheel.com.

usage: python3 n8n/build_alerts_workflow.py

Reads ALERT_WEBHOOK_SECRET from this repo's .env.local and the n8n API key from August Engine's. Writes a copy to
n8n/ghanamaxxing-alerts.json with the secret taken out. Only ever touches this one workflow.
"""
import json
import os
import re
import urllib.error
import urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


def env(path):
    return dict(re.findall(r"^(\w+)=(.*)$", open(path).read(), re.M))


SECRET = env(os.path.join(ROOT, ".env.local"))["ALERT_WEBHOOK_SECRET"].strip().strip('"')
KEY = env("/Users/aosei/Documents/August Engine/.env.local")["N8N_API_KEY"].strip().strip('"')
BASE = "https://n8n.augustwheel.com"
NAME = "Ghanamaxxing — Alerts"

# Anything without the right secret stops here. Text is escaped because it comes from public forms.
CODE = """const body = $json.body || {};
if (($json.headers || {})['x-webhook-secret'] !== '__SECRET__') return [];
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
const rows = (body.lines || []).map(([label, value]) => `<p style="margin:0 0 12px"><strong>${esc(label)}</strong><br>${esc(value)}</p>`).join('');
return [{ json: {
  subject: `Ghanamaxxing: ${String(body.subject || 'new request').replace(/[\\r\\n]+/g, ' ').slice(0, 150)}`,
  html: `<div style="font-family:sans-serif;font-size:15px">${rows}<p style="margin-top:20px;color:#777">Saved in Supabase. Reply to this email to answer them, if they left an address.</p></div>`,
  replyTo: /^[^\\s@,;<>]+@[^\\s@,;<>]+$/.test(body.replyTo || '') ? body.replyTo : '',
} }];"""


def workflow(secret):
    return {
        "name": NAME,
        "nodes": [
            {"id": "webhook", "name": "Site webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 0], "webhookId": "ghanamaxxing-alerts",
             "parameters": {"httpMethod": "POST", "path": "ghanamaxxing-alerts", "responseMode": "responseNode", "options": {}}},
            {"id": "respond", "name": "Respond immediately", "type": "n8n-nodes-base.respondToWebhook", "typeVersion": 1, "position": [240, -120],
             "parameters": {"respondWith": "noData", "options": {}}},
            {"id": "build", "name": "Check secret and build email", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [240, 120],
             "parameters": {"jsCode": CODE.replace("__SECRET__", secret)}},
            {"id": "email", "name": "Email August", "type": "n8n-nodes-base.gmail", "typeVersion": 2, "position": [480, 120],
             "credentials": {"gmailOAuth2": {"id": "XSli9zjeTSRhQNLt", "name": "Gmail account"}},
             "parameters": {"sendTo": "augustministry@gmail.com", "subject": "={{ $json.subject }}", "message": "={{ $json.html }}",
                            "options": {"appendAttribution": False, "senderName": "Ghanamaxxing", "replyTo": "={{ $json.replyTo }}"}}},
        ],
        "connections": {
            "Site webhook": {"main": [[{"node": "Respond immediately", "type": "main", "index": 0}, {"node": "Check secret and build email", "type": "main", "index": 0}]]},
            "Check secret and build email": {"main": [[{"node": "Email August", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
    }


def api(method, path, body=None):
    req = urllib.request.Request(f"{BASE}/api/v1{path}", method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"X-N8N-API-KEY": KEY, "Content-Type": "application/json", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            raw = res.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as err:
        raise SystemExit(f"{method} {path} -> {err.code}: {err.read()[:400].decode(errors='replace')}")


existing = next((w for w in api("GET", "/workflows?limit=250")["data"] if w["name"] == NAME), None)
wf = api("PUT", f"/workflows/{existing['id']}", workflow(SECRET)) if existing else api("POST", "/workflows", workflow(SECRET))
api("POST", f"/workflows/{wf['id']}/activate")
print("workflow", wf["id"], "updated" if existing else "created", "and active")
print("webhook", f"{BASE}/webhook/ghanamaxxing-alerts")
with open(os.path.join(ROOT, "n8n", "ghanamaxxing-alerts.json"), "w") as f:
    json.dump(workflow("__ALERT_WEBHOOK_SECRET__"), f, indent=2, ensure_ascii=False)
