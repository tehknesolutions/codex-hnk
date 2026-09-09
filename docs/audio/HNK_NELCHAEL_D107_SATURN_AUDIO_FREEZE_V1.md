# HNK Nelchael Day 107 Saturn Audio Freeze V1

Status: **APPROVED CANONICAL AUDIO DEFINITION / RUNTIME PUBLICATION QA PENDING**

Scope: Binah · Day 107 · Nelchael · Consagração do Altar de Binah.

Preset pair:

- `HNK-NELCHAEL-D107-SATURN-ACTIVE-V1`
- `HNK-NELCHAEL-D107-SATURN-CONTROL-V1`

Provenance:

`docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md`

## 1. Frozen source reconciliation

The original Day 107 plan supplies the ritual label `frequência planetária de Saturno`, but no numeric frequency.

HNK therefore explicitly adopts the Cousto Cosmic Octave Saturn tone as a new editorial reference:

```text
Saturn carrier identity = 147.85 Hz
```

The HNK app architecture separately supplies the Theta synthesis difference:

```text
Theta difference = 4 Hz
right = base + difference
```

The two source roles remain separate. The `4 Hz` difference is not presented as a Saturn frequency.

## 2. ACTIVE

```text
left carrier          147.85 Hz
right carrier         151.85 Hz
binaural difference     4.00 Hz
waveform                 sine
gain per channel         0.06
duration               600 s
```

Preset ID:

`HNK-NELCHAEL-D107-SATURN-ACTIVE-V1`

Deterministic one-second PCM16 stereo / 44.1 kHz render SHA-256:

`9f21167fa7f733402894f81020474437a5857be6805f5847202d4827ced44c10`

## 3. CONTROL

```text
left carrier          147.85 Hz
right carrier         147.85 Hz
binaural difference      0 Hz (inactive by design)
waveform                 sine
gain per channel         0.06
duration               600 s
```

Preset ID:

`HNK-NELCHAEL-D107-SATURN-CONTROL-V1`

Deterministic one-second PCM16 stereo / 44.1 kHz render SHA-256:

`15a1ece7c10371d4e4054333295c2e8ef11791463a532b3e0cd15bed198ee010`

The CONTROL is represented as `stereo-control`, not as a zero-Hz binaural layer.

## 4. Duration and safety envelope

The source plan does not assign a duration to Day 107 audio. V1 therefore adopts the already frozen HNK ritual-player product baseline used by Haziel:

- duration `600 s`;
- gain per channel `0.06`;
- `maxOutputGain = 0.08`;
- fade-in `5 s`;
- fade-out `10 s`;
- autoplay forbidden;
- explicit start required;
- user-controlled volume required;
- pause/resume where supported;
- immediate stop required;
- Safety Stop for pain, irritation, tinnitus, malaise or meaningful discomfort.

These are product decisions for consistent runtime/safety behavior. They are not planetary correspondences.

## 5. Render verification

The deterministic render algorithm is the same PCM16 stereo sine-loop procedure already used by the approved Haziel Day 045 preset. Reproducing the Haziel input with that implementation yields the existing Haziel checksums before calculating the Saturn pair, providing an implementation cross-check.

## 6. Epistemic boundary

The player may state what it reproduced:

- Saturn carrier mapping `147.85 Hz`;
- ACTIVE right carrier `151.85 Hz`;
- binaural difference `4 Hz`;
- duration and preset version.

The player must not claim that playback proves or guarantees:

- a Theta neurological state;
- concentration;
- healing;
- planetary transmission;
- occult attainment;
- spiritual superiority.

## 7. Approval / release boundary

This freeze resolves the Day 107 **canonical audio-definition** blocker. The preset pair is `approved`, not `published`.

Web/Native integration, start/pause/resume/stop/volume behavior, lifecycle handling and device/listening QA remain G7/G8 before runtime publication.

Day 107 may proceed to editorial G4/G5 review using this freeze without pretending runtime QA is already complete.
