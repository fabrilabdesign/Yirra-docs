---
sidebar_position: 5
---

# Assembly Guide

Step-by-step instructions for assembling your Replicant GEN 1 (IC-01).

![Chassis Assembly](/img/drone/Chassis.gif)

## Pre-Assembly (Dry Fit)

Before permanent assembly, test fit all components:

### 1. Arm Tube Installation

1. **Insert arm tubes** (11mm OD carbon) into printed roots and tips
2. Confirm slip-fit without wobble
3. If too tight: lightly sand tube ends
4. If too loose: consider thin shim or adhesive

:::tip Tube Fit
The fit should be snug but not requiring force. The clamp screws will provide the final security - don't rely on friction fit alone.
:::

### 2. Exospine Assembly

1. **Assemble exospine** (mid-spine blocks + 4mm carbon plate)
2. Install rail blocks
3. **Test battery slide** - should move smoothly without binding
4. Check retention pawl engagement

![Exploded Assembly View](/img/drone/Explode_view.png)

### 3. Shell Fit Check

1. **Join front and rear shells** around spine (no electronics yet)
2. Verify clearances for:
   - FC stack mounting
   - VTX and antennas
   - GPS mast
   - Camera cradle
3. Check all mounting holes align

:::warning If Parts Bind
Adjust heat-set inserts or lightly file internal ribs. Don't force assembly - it should go together smoothly.
:::

## Electronics Stack Assembly

### 1. ESC Installation

1. **iFlight Blitz E55 ESC** - verify correct model
2. Add **input capacitor** (≥1000µF, 35-50V) to ESC battery pads
   - Solder negative to ground
   - Solder positive to VBAT
   - Keep leads short (under 20mm)
3. Prepare motor leads (extend if needed for internal routing)

### 2. Flight Controller Mounting

1. Decide on soft-mount vs hard-mount:
   - **Hard mount**: If airframe provides good vibration isolation
   - **Soft mount**: For additional isolation if needed
2. Connect ESC signal wires to FC (M1-M4 pads)
3. Connect current sensor and telemetry
4. Route carefully to avoid pinching under stack edges

### 3. Power Distribution

```
Battery (6S) → XT60 → Capacitor (+/−) → ESC VBAT pads
                                      ↓
                        ESC → FC (5V/GND or direct VBAT)
```

### 4. Video System

#### DJI O4 Pro / O3 Installation

1. Mount camera on **isolated cradle** with TPU bobbins
2. Keep lens **centered** to nose opening
3. Route camera cable to VTX
4. Mount VTX in designated bay
5. Connect antennas to printed mounts
6. **Avoid tight bends** in coax cable

:::tip Camera Alignment
The camera isolation is critical for jello-free footage. Don't overtighten camera cradle screws - just snug enough to prevent movement.
:::

### 5. Receiver Installation

1. Place RX **away from** high-current power lines
2. Use printed antenna mounts for optimal diversity
3. ELRS: Mount antennas perpendicular (T-formation)
4. Connect to FC UART (check pinout)

### 6. GPS & Compass

1. Mount on **rear mast/fin**
2. Keep **clear** of:
   - High-current wires
   - VTX and antennas

![GPS Installation](/img/drone/GPS_reveal.png)
   - Large metal components
3. Align arrow with forward direction
4. Note orientation for firmware setup

### 7. Cable Management

- Use printed clips for clean runs
- Keep signal wires away from motor leads
- No loose loops that can vibrate
- Protect wire exits with printed grommets

## Airframe Final Assembly

### 1. Arm Installation

1. **Install arm roots** into front shell bulkhead
2. Insert into spine block attachment points
3. Torque screws **evenly** (don't crush tubes)
   - Recommended: 0.8-1.0 Nm
4. Apply blue threadlocker to metal-to-metal joints

### 2. Arm Tips & Props

1. **Fit arm tips** to tube ends
2. Check **propeller arc clearance**:
   - No contact with nose cone
   - No contact with rear shell
   - Minimum 5mm clearance recommended
3. Don't install props yet (safety)

### 3. Shell Joining

1. **Capture electronics stack** between front and rear shells
2. Route all wires through designated channels
3. Join shells over exospine
4. Install screws with threadlocker (blue, sparingly)
5. **Check**: Nothing pinched, all functions accessible

### 4. Landing Gear

1. Install TPU landing pads on designated points
2. Add protective skids if desired
3. Ensure level stance

### 5. Battery Rails

1. Install battery rails to exospine
2. Verify retention pawl/latch operation
3. Test slide action with empty battery shell
4. Adjust if binding

## Power System Integration

### Battery Installation

1. **Slide modular battery** onto rails
2. Push until latch/pawl **clicks**
3. Gentle tug to confirm secure

### Center of Gravity Check

With props fitted and battery loaded:

1. Balance aircraft on arm plane
2. **Target CG**: Near arm mounting points
3. If nose-heavy: Move battery rearward
4. If tail-heavy: Move battery forward or add nose weight

:::warning CG is Critical
An incorrect CG will make the aircraft unstable or require excessive control inputs. Take time to get this right.
:::

### Clearance Verification

- Battery shell clear of props (minimum 10mm)
- No interference with antennas
- GPS mast not shadowed by battery

## Pre-Power Checklist

Before connecting battery:

- [ ] All screws torqued, no play in arms
- [ ] Props NOT installed (safety)
- [ ] ESC capacitor securely soldered
- [ ] All connections solid (no cold joints)
- [ ] Motor leads not touching carbon or metal
- [ ] Battery polarity correct (XT60 keyed, but verify)

## First Power-Up

### Use a Smoke Stopper!

A smoke stopper limits current and prevents fires from wiring errors.

1. Connect **smoke stopper** between battery and aircraft
2. Plug in battery
3. **Watch for**:
   - Smoke or burning smell → DISCONNECT IMMEDIATELY
   - FC LED lights up
   - ESC beep sequence
   - No excessive heat
4. If all good after 30 seconds, disconnect and proceed without smoke stopper

### Component Test

With battery connected (no smoke stopper):

1. **FC**: Verify boot, LED patterns normal
2. **ESC**: Listen for correct beep sequence
3. **VTX**: Check video feed on goggles
4. **RX**: Verify link to radio (check sticks move in configurator)
5. **GPS**: Wait for satellite fix (may take 5-10 min on first boot)

:::tip Motor Direction Test
Before installing props, use motor test function in configurator at LOW throttle to verify:
- Correct motor order (front-left, front-right, rear-right, rear-left)
- Correct spin direction (props-off!)
:::

## Final Assembly Checks

- [ ] All screws torqued to spec
- [ ] No sharp edges on carbon
- [ ] Camera secure but not over-tightened
- [ ] Antennas properly mounted
- [ ] GPS has clear sky view
- [ ] Battery retention solid
- [ ] All wires secured, no loose loops

## Installing Propellers

:::danger Props Last!
Only install propellers after ALL testing is complete and you're ready for first flight.
:::

1. Verify correct props for each motor (CW/CCW)
2. Check prop hubs for cracks
3. Torque prop nuts evenly
4. **Final check**: Rotate each prop by hand
   - No contact with frame
   - No unusual resistance
   - Secure on motor shaft

## Weight & Balance

Record your final build:

- **All-Up Weight (AUW)**: _______ grams
- **Battery**: _______ mAh, _______ grams
- **CG Position**: _______ mm from nose

## Next Steps

With assembly complete, proceed to:
1. **Flight Controller Setup** - Configure your FC using Betaflight or INAV configurator
2. [Tuning & Maiden Flight](/docs/build-guides/tuning) - First flight procedures

