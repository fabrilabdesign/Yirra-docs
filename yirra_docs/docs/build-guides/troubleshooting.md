---
sidebar_position: 8
---

# Troubleshooting Guide

Common issues and solutions for the Replicant GEN 1 platform.

## Video Issues

### Jello in Footage

**Symptoms:** Wavy/jello effect in video, especially during acceleration or maneuvers

**Causes & Solutions:**

1. **Camera Isolation**
   - Check camera cradle TPU bobbins
   - Verify nose cone screws not over-torqued
   - Add mass damper pad behind camera

2. **Propeller Issues**
   - Inspect for bent props
   - Check prop balance
   - Verify prop hubs not cracked

3. **Frame Vibrations**
   - Confirm arm tubes fully seated in roots
   - Check for loose screws in arm mounts
   - Verify exospine assembly is solid

:::tip Quick Test
Record blackbox during hover. High gyro noise (over 50 deg/s RMS) indicates mechanical vibration issue rather than tuning problem.
:::

### Poor Video Range/Quality

**Symptoms:** Video breakup, static, or loss at close range

**Causes & Solutions:**

1. **Antenna Issues**
   - Verify antennas properly mounted
   - Check for damaged antenna elements
   - Ensure proper diversity (perpendicular orientation)

2. **Interference**
   - Separate VTX from GPS/compass
   - Add ferrites to ESC power leads
   - Shield GPS cable if near VTX

3. **Power Supply**
   - Check VTX getting clean power
   - Verify capacitor on ESC
   - Test voltage under load

## Flight Performance Issues

### High Vibrations / Hot Motors

**Symptoms:** Motors warm/hot after brief flight, oscillations in flight

**Causes & Solutions:**

1. **PID Tuning**
   - Reduce D-gain by 10-15%
   - Lower P-gain if motors very hot
   - Enable RPM filtering if not already

2. **Mechanical**
   - Balance all propellers
   - Check arm tube installation (no play)
   - Verify motor mounts tight
   - Inspect motor bearings

3. **ESC Settings**
   - Confirm bidirectional DShot enabled
   - Check motor timing (auto usually best)
   - Verify ESC firmware up to date

:::warning Overheating Motors
If motors are too hot to touch after 30s hover, DO NOT continue flying. This will damage motors and ESC. Reduce D-gain immediately.
:::

### Oscillations/Wobbles

**Symptoms:** Aircraft shakes or wobbles, especially in forward flight

**Causes:**

1. **P-gain too high** → Reduce P by 10% increments
2. **D-gain too low** → Increase D slightly (5% increments)
3. **Loose hardware** → Check all screws and arm mounting
4. **CG incorrect** → Verify center of gravity position

### Poor GPS Performance

**Symptoms:** GPS dropouts, won't get fix, or HDOP too high

**Causes & Solutions:**

1. **Interference**
   - Increase separation from VTX (minimum 10cm)
   - Keep away from high-current power wires
   - Add ferrite beads to ESC battery leads
   - Use shielded GPS cable

2. **Mounting**
   - Ensure GPS has clear view of sky
   - No metal objects blocking antenna
   - Compass orientation set correctly in FC

3. **Environment**
   - First fix can take 5-10 minutes outdoors
   - Urban areas have more interference
   - Bad weather affects signal quality

### Crashes on GPS Rescue/RTH

**Causes:**

1. **Insufficient tuning** → Tune in manual first
2. **GPS HDOP too high** → Wait for better fix before enabling
3. **Rescue climb rate too aggressive** → Reduce in FC settings
4. **Compass interference** → Check compass calibration, move away from metal

## Mechanical Issues

### Battery Won't Slide/Lock

**Symptoms:** Battery pack binds on rails or latch won't engage

**Causes & Solutions:**

1. **Rail Obstructions**
   - Deburr printed rail edges
   - Check for debris in channels
   - Verify rails parallel (not twisted)

2. **Latch/Pawl**
   - Inspect pawl spring tension
   - Lubricate latch lightly (dry lube)
   - Verify battery shell not deformed

3. **Shell Rubbing**
   - Check rear shell clearance to battery
   - Verify battery pack dimensions match spec

### Arm Tube Slippage

**Symptoms:** Arm tubes rotate or pull out of bosses

**Causes & Solutions:**

1. **Under-Torqued**
   - Retorque clamp screws evenly
   - Use threadlocker (blue)

2. **Worn Tube Surface**
   - Light scuff with sandpaper for grip
   - Consider thin shim if hole enlarged

3. **Wrong Tube Diameter**
   - Verify 11mm OD tubes
   - Check printed boss hole didn't warp

:::danger Safety Issue
Loose arm tubes can cause in-flight failure. Always check arm tightness before every flight.
:::

## Electrical Issues

### ESC Won't Arm / No Motor Response

**Symptoms:** ESC beeping, won't arm, or motors don't respond

**Causes & Solutions:**

1. **Arming Prevented**
   - Check FC arming flags (CLI: `status`)
   - Verify sticks at correct positions
   - Confirm gyro calibrated on level surface

2. **Signal Issues**
   - Verify DShot protocol matches FC & ESC settings
   - Check motor signal wires not reversed
   - Test with different DShot speed (600 → 300)

3. **Power Issues**
   - Confirm battery charged (minimum 3.5V/cell)
   - Check main power connections
   - Verify ESC getting 5V from BEC or FC

### Brownouts/Resets in Flight

**Symptoms:** FC or VTX reboots during throttle blips

**Causes & Solutions:**

1. **Insufficient Filtering**
   - Upgrade capacitor (try 2000µF+)
   - Add TVS diode across battery input
   - Shorten power lead lengths

2. **Poor Connections**
   - Check all solder joints (especially ground)
   - Verify battery connector not loose
   - Test battery connector resistance

3. **Weak Battery**
   - Test battery voltage under load
   - Check for damaged cells
   - Try different battery

## Software/Firmware Issues

### Betaflight Won't Connect

**Symptoms:** Can't connect to FC in Betaflight Configurator

**Causes & Solutions:**

1. **USB Cable**
   - Try different cable (data, not charge-only)
   - Test different USB port
   - Check for damaged FC USB port

2. **Drivers**
   - Install/update CP210x or STM32 VCP drivers
   - Try Impulse RC Driver Fixer (Windows)

3. **FC in DFU Mode**
   - Disconnect, hold boot button, reconnect
   - Flash firmware in DFU mode
   - Release boot button after flashing

### GPS Won't Initialize

**Symptoms:** "NO GPS" in OSD despite GPS connected

**Causes:**

1. **UART Configuration**
   - Enable GPS on correct UART port
   - Set baud rate (usually 115200 for M10)
   - Set protocol to UBLOX or AUTO

2. **Wiring**
   - Verify TX → RX, RX → TX (crossed)
   - Confirm 5V and GND connections
   - Check for damaged wires

## Build Quality Issues

### Frame Creaking/Flexing

**Symptoms:** Audible creaks or visible frame flex

**Causes:**

1. **Under-torqued fasteners** → Retorque all screws
2. **Missing reinforcement plates** → Install all carbon plates per BOM
3. **Inadequate print quality** → Reprint critical parts in PA-CF

### Weight Significantly Off Target

**Symptom:** Build much heavier than expected (over 200g from target)

**Common causes:**

- Excessive solder/wire
- Wrong battery choice
- Additional unauthorized components
- Over-built (too many screws, excess adhesive)

**Solutions:**
- Review BOM for correct parts
- Minimize solder blobs
- Route wires efficiently
- Remove unnecessary components

## Diagnostic Tools

### Blackbox Logging

Essential for diagnosing flight issues:
1. Enable blackbox logging
2. Record 30-60s flight including problem behavior
3. Review in Blackbox Explorer:
   - Gyro traces for vibration
   - PID response for tuning
   - Motor output for balance

### Motor Testing

Safe motor checkout procedure:
1. Remove ALL propellers
2. Use Motor Test tab in configurator
3. Test each motor at 10-15% throttle
4. Listen for unusual sounds
5. Check temperature after 30s run

## When to Ask for Help

If you've tried the above and still have issues:

1. **Document the problem:**
   - What's happening vs what should happen
   - When does it occur
   - What you've tried

2. **Gather data:**
   - Blackbox log (if flight-related)
   - Photos of build
   - FC CLI dump
   - Component list

3. **Contact support:**
   - [Yirra Systems Contact](https://yirrasystems.com/contact)
   - Include documentation and data
   - Be specific about your configuration

## Safety Reminders

- Never fly with known mechanical issues
- Always use a smoke stopper for first power-up
- Test in safe areas away from people
- Keep spare parts for common failures (props, arms, nose cone)

## Next Steps

- [Tuning Guide](/docs/build-guides/tuning) - Optimize performance
- [Assembly Guide](/docs/build-guides/assembly) - Review build steps
- [Main Documentation](/docs/intro) - Return to docs home

