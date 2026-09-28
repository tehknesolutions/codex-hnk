$ErrorActionPreference = "Stop"

$Repo = "E:\codex-hnk"
$Source = "E:\codex-hnk\_incoming\visual-target-v1"
$Dest = "docs\design\visual-target-v1\sources"

$Sources = @(
    @{ Id="VS-01"; Hash="39a8c5c8bab1fa525d4bf40abd4c8fa082e033c4b1f68928f30848c3bddcf958"; Dest="VS-01-mapa-sete-pilares.png" },
    @{ Id="VS-02"; Hash="76a7ac24f0c68bafe3940f0a0553a629ac21208ab195aa3a33c7146c91ab0bde"; Dest="VS-02-painel-cosmico-codex-hnk.png" },
    @{ Id="VS-03"; Hash="59b497ba68ef24195aca2ad3515be44379f9fce712595270a6374dc57acd0d98"; Dest="VS-03-vida-que-transforma.png" },
    @{ Id="VS-04"; Hash="8b673149867fafcb170664d96d0d41952a9c613575eba6cd52098719665ef2be"; Dest="VS-04-lab-001-coroa-antes-da-forma-03.png" },
    @{ Id="VS-05"; Hash="67a8868ee44f768ebac13310e9023ec354fcc356a10870cb85581fd369f5c147"; Dest="VS-05-portal-cosmico-codex-hnk.png" },
    @{ Id="VS-06"; Hash="c8697c92f0c5684de6c572a14f2e29652464f41b4725c1cbfc41b16612d5b0ed"; Dest="VS-06-lab-001-coroa-antes-da-forma-02.png" },
    @{ Id="VS-07"; Hash="df00d604e8092919793706c26bc3499ea3c2315d8372d66a7cefe970643a1ce7"; Dest="VS-07-lab-001-coroa-antes-da-forma-01.png" },
    @{ Id="VS-08"; Hash="c1302406c4ed280ce10b218c204e47ccf147626639ee4d2b9b814dfb20dd9e0f"; Dest="VS-08-lab-001-coroa-antes-da-forma.png" },
    @{ Id="VS-09"; Hash="15f87261e9e1f5003cf7197c1ef4ead9934eb3792a14522a2eefd69255a24f6b"; Dest="VS-09-codex-digital-salto-cosmico.png" },
    @{ Id="VS-10"; Hash="4f491a4399ae7c13a42d907205a42537d78a9568312874bbc79b70c1ace8c410"; Dest="VS-10-henuvokodan-arvore-portais.png" },
    @{ Id="VS-11"; Hash="ce9fda1ee5394bbab386ecf56428be7a7b3212d95b18e6d07a98c41f3ddaf898"; Dest="VS-11-colagem-cosmica-codex-hnk.png" },
    @{ Id="VS-12"; Hash="7cb7783abe841cc1be7fe41881f0877101b713852de48d1c87154cd130836fe6"; Dest="VS-12-proximo-passo-codex-digital.png" }
)

if (-not (Test-Path $Repo)) { throw "Repo não encontrado: $Repo" }
New-Item -ItemType Directory -Path $Source -Force | Out-Null
Set-Location $Repo
New-Item -ItemType Directory -Path (Join-Path $Repo $Dest) -Force | Out-Null

$byHash = @{}
Get-ChildItem -LiteralPath $Source -File | ForEach-Object {
    $h = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLower()
    if ($byHash.ContainsKey($h)) { throw "Hash duplicado no incoming: $h" }
    $byHash[$h] = $_
}

$missing = @()
foreach ($s in $Sources) {
    if (-not $byHash.ContainsKey($s.Hash)) { $missing += $s.Id }
    else { Copy-Item -LiteralPath $byHash[$s.Hash].FullName -Destination (Join-Path $Repo "$Dest\$($s.Dest)") -Force }
}

if ($missing.Count -gt 0) {
    Write-Host "UPLOAD BLOQUEADO: faltam $($missing.Count) fontes: $($missing -join ', ')"
    exit 2
}

git add "$Dest"
git commit -m "assets(codex): persist 12 canonical visual sources"
git push origin docs/visual-source-dissection-v1
Write-Host "UPLOAD OK: VS-01..VS-12"
