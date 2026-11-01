"""Create or update the "Ghanamaxxing — Maker emails" workflow on n8n.augustwheel.com.

usage: python3 n8n/build_maker_emails_workflow.py

Two jobs: a webhook that sends an email to whoever submitted a listing, and a schedule that asks the site every 10 minutes
to email anyone whose listing has been approved. Reads ALERT_WEBHOOK_SECRET from this repo's .env.local and the n8n API key
from August Engine's. Writes a copy to n8n/ghanamaxxing-maker-emails.json with the secret taken out. Only touches this workflow.
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
NAME = "Ghanamaxxing — Maker emails"
SITE_JOB = "https://www.ghanamaxxing.com/api/maker-emails"

# Anything without the right secret stops here. Text is escaped, and only https links to the site itself become links.
CODE = """const body = $json.body || {};
if (($json.headers || {})['x-webhook-secret'] !== '__SECRET__') return [];
const to = String(body.to || '');
if (!/^[^\\s@,;<>]+@[^\\s@,;<>]+\\.[^\\s@,;<>]+$/.test(to)) return [];
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = (body.paragraphs || []).map((p) => `<p style="margin:0 0 14px">${esc(p)}</p>`).join('');
const link = body.link && String(body.link.url).startsWith('https://www.ghanamaxxing.com/')
  ? `<p style="margin:0 0 14px"><a href="${esc(body.link.url)}">${esc(body.link.label)}</a></p>`
  : '';
return [{ json: {
  to,
  subject: String(body.subject || 'Ghanamaxxing').replace(/[\\r\\n]+/g, ' ').slice(0, 150),
  html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#222">${text}${link}<p style="margin:20px 0 0">Augustine<br>Ghanamaxxing</p></div>`,
  replyTo: String(body.replyTo || ''),
} }];"""


def workflow(secret):
    return {
        "name": NAME,
        "nodes": [
            {"id": "webhook", "name": "Site webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 0], "webhookId": "ghanamaxxing-maker-email",
             "parameters": {"httpMethod": "POST", "path": "ghanamaxxing-maker-email", "responseMode": "responseNode", "options": {}}},
            {"id": "respond", "name": "Respond immediately", "type": "n8n-nodes-base.respondToWebhook", "typeVersion": 1, "position": [240, -120],
             "parameters": {"respondWith": "noData", "options": {}}},
            {"id": "build", "name": "Check secret and build email", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [240, 120],
             "parameters": {"jsCode": CODE.replace("__SECRET__", secret)}},
            {"id": "email", "name": "Email the maker", "type": "n8n-nodes-base.gmail", "typeVersion": 2, "position": [480, 120],
             "credentials": {"gmailOAuth2": {"id": "XSli9zjeTSRhQNLt", "name": "Gmail account"}},
             "parameters": {"sendTo": "={{ $json.to }}", "subject": "={{ $json.subject }}", "message": "={{ $json.html }}",
                            "options": {"appendAttribution": False, "senderName": "Ghanamaxxing", "replyTo": "={{ $json.replyTo }}"}}},
            {"id": "schedule", "name": "Every 10 minutes", "type": "n8n-nodes-base.scheduleTrigger", "typeVersion": 1.2, "position": [0, 360],
             "parameters": {"rule": {"interval": [{"field": "minutes", "minutesInterval": 10}]}}},
            {"id": "job", "name": "Ask the site to email approved listings", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [240, 360],
             "onError": "continueRegularOutput",
             "parameters": {"method": "POST", "url": SITE_JOB, "sendHeaders": True,
                            "headerParameters": {"parameters": [{"name": "X-Webhook-Secret", "value": secret}]}, "options": {}}},
        ],
        "connections": {
            "Site webhook": {"main": [[{"node": "Respond immediately", "type": "main", "index": 0}, {"node": "Check secret and build email", "type": "main", "index": 0}]]},
            "Check secret and build email": {"main": [[{"node": "Email the maker", "type": "main", "index": 0}]]},
            "Every 10 minutes": {"main": [[{"node": "Ask the site to email approved listings", "type": "main", "index": 0}]]},
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
print("webhook", f"{BASE}/webhook/ghanamaxxing-maker-email")
with open(os.path.join(ROOT, "n8n", "ghanamaxxing-maker-emails.json"), "w") as f:
    json.dump(workflow("__ALERT_WEBHOOK_SECRET__"), f, indent=2, ensure_ascii=False)
