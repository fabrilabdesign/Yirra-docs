---
sidebar_position: 8
---

# Tuning & Maiden Flight

Procedures for first flight and performance optimization.

![Flight Footage](/img/drone/Flight_footage.gif)

## Pre-Flight Verification

Complete this checklist before maiden flight:

### Visual Inspection
- [ ] All screws torqued, no play in arms
- [ ] Props tight, correct rotation direction
- [ ] No shell interference with props (5mm+ clearance)
- [ ] Battery secure on rails, latch engaged
- [ ] Antennas secure and properly oriented
- [ ] Camera lens clean and aligned

### Electronic Systems
- [ ] RX link quality stable (over 90%)
- [ ] VTX clean image on goggles
- [ ] GPS fix with ≥8 satellites
- [ ] Compass heading correct
- [ ] OSD displaying all critical data
- [ ] Failsafe tested (pull RX antenna → verify behavior)

### Motor Tests
- [ ] Motor temps cool after 60s hover throttle (props on, suspended)
- [ ] No unusual sounds or vibrations
- [ ] ESC not beeping errors
- [ ] Current draw reasonable at hover (~40-60% throttle)

![Super Stable Flight](/img/drone/super-stable-flight-12.gif)

## Flight Site Selection

Choose your maiden flight location carefully:

### Requirements
- **Clear area**: Minimum 100m radius, no obstacles
- **Grass or soft ground**: For gentle landings
- **No people**: Keep 50m+ from spectators
- **Legal airspace**: Check local UAV regulations
- **Good visibility**: Overcast days avoid sun glare

### Avoid
- Near airports or restricted airspace
- High-traffic areas
- Strong winds (over 5 m/s for maiden)
- Electrical interference sources

## Maiden Flight Procedure

### Flight 1: Hover Test

**Goal:** Verify basic stability and check for vibrations

1. **Arm** at low altitude (under 1m)
2. **Gentle lift-off** to 2m AGL
3. **Hover for 30-60 seconds**:
   - Watch OSD for warnings
   - Listen for oscillations
   - Feel for unusual behavior
4. **Land smoothly**
5. **Immediate checks**:
   - Touch motors (should be warm, not hot)
   - Check props (no damage)
   - Review blackbox if strange behavior

**OSD Check During Hover:**
- Battery voltage stable
- Current draw 8-15A (depends on AUW)
- No gyro overflow warnings
- GPS lock maintained

:::tip Vibration Check
If aircraft shakes or oscillates in hover, land immediately. Check [Troubleshooting - High Vibrations](/docs/build-guides/troubleshooting#high-vibrations--hot-motors).
:::

### Flight 2: Gentle Circuits

**Goal:** Test basic flight characteristics

1. Hover at 3-5m
2. **Slow forward** flight (3-5 m/s)
3. **Gentle turns** (bank under 30°)
4. **Figure-8 pattern** at walking pace
5. Fly for 2-3 minutes
6. Land

**Listen for:**
- Motor tone changes (indicating oscillations)
- Unusual sounds from airframe
- ESC beeping

**Watch for:**
- Camera jello in video feed
- Unexpected drift
- Control response issues

### Flight 3: Speed Test

**Goal:** Verify no high-speed oscillations

1. Climb to 20m
2. **Accelerate** to 40-60 km/h straight line
3. **Hold speed** for 5-10 seconds
4. **Gentle maneuvers** at speed
5. Return and land

**Check video recording:**
- No jello at cruise speed
- Stable horizon
- Smooth transitions

:::warning High-Speed Oscillations
If aircraft shakes at speed, reduce D-gain by 10%. If very severe, land immediately and reduce both P and D.
:::

## PID Tuning Process

### When to Tune

Tune if you experience:
- Oscillations or wobbles
- Hot motors after short flights
- Poor propwash handling
- Sluggish or delayed response

### Tuning Approach

#### 1. Enable Blackbox Logging

In **Blackbox** tab:
- Set sample rate: 1kHz for 7-8" props
- Enable PID logging
- Record multiple flight types

#### 2. Baseline Tune Check

Fly and record blackbox:

```
Test Pattern:
1. Hover (10s)
2. Forward cruise (10s)
3. Aggressive maneuvers (10s)
4. Propwash descent test (10s)
```

#### 3. Analyze in Blackbox Explorer

**What to look for:**

**Gyro Noise:**
- Under 30 deg/s RMS = excellent
- 30-50 deg/s = acceptable
- Over 50 deg/s = mechanical issue

**PID Response:**
- P term: Should follow setpoint cleanly
- D term: Smooth damping, not excessive
- I term: Corrects drift without oscillation

#### 4. Adjust PIDs

**For hot motors / high noise:**
```
Reduce D by 10-15%
Optionally reduce P by 5-10%
Test → Review blackbox → Repeat
```

**For oscillations:**
```
Reduce P by 10%
Reduce D by 5%
Test → Review → Repeat until smooth
```

**For sluggish response:**
```
Increase P by 5-10%
Test → If motors hot, reduce D
```

:::tip Incremental Changes
Change ONE parameter at a time. Fly, log, review, adjust. Never change multiple things between test flights.
:::

### Rate Profile

For long-range cruising:

```
RC Rate: 1.0-1.2
Super Rate: 0.60-0.70
Expo: 0.20-0.30

Max Rotation:
  Roll: 400-500 deg/s
  Pitch: 400-500 deg/s
  Yaw: 300-400 deg/s
```

For aggressive flying, increase rates to preference.

## Camera Tuning

### Jello Elimination

If video shows jello after initial flights:

1. **Check camera isolation:**
   - TPU bobbins not over-compressed
   - Camera cradle screws just snug (not tight)
   - Add mass damper pad behind camera

2. **Verify mechanical:**
   - Props balanced
   - Arms solid (no play)
   - Nose cone screws at correct tension

3. **Filter tuning:**
   - Enable all recommended filters
   - Consider increasing gyro lowpass slightly
   - Check motor temperatures aren't excessive

### Camera Angle

Adjust camera tilt for flight style:

- **LR Cruising**: 15-25° up
- **FPV Racing**: 30-45° up
- **Cinematic**: 0-15° (more level)

## GPS Rescue Tuning

### Initial Test (Controlled)

1. Climb to 30m
2. Disarm or trigger failsafe
3. **Observe:**
   - Aircraft climbs (if below return altitude)
   - Turns toward home
   - Descends over home point
4. Take manual control before landing

### Parameter Adjustment

If GPS rescue behavior isn't ideal:

**Climbs too aggressively:**
```
Reduce initial climb rate
Reduce max ascent angle
```

**Returns too fast:**
```
Reduce ground speed
Increase descent rate (for quicker landing)
```

**Overshoots home:**
```
Reduce ground speed
Tune descent cone (advanced)
```

## Performance Benchmarking

### Flight Time Testing

1. Fully charge battery
2. Fly **gentle cruising** pattern (50% throttle average)
3. Land at 3.5V per cell (conservative)
4. Record:
   - Flight time
   - mAh consumed (from OSD)
   - Average throttle %

**Calculate efficiency:**
```
mAh per minute = Total mAh / Flight minutes
Estimated flight time = (Battery capacity × 0.8) / mAh per minute
```

### Current Draw Baseline

Record typical values:

- **Hover:** _____A @ _____% throttle
- **Cruise (50%):** _____A
- **Full throttle:** _____A (brief bursts)

### Motor Temperature

After 5-minute flight:

- **Normal:** Warm to touch (40-60°C)
- **Acceptable:** Hot but can hold (60-80°C)
- **Too hot:** Can't touch (over 80°C) → Reduce D-gain

## Advanced Tuning

### Feedforward

Improves stick response:

```
Start: 70-80
Increase if: Want snappier response
Decrease if: Aircraft overshoots
```

### TPA (Throttle PID Attenuation)

Reduces PID at high throttle:

```
TPA Breakpoint: 1500 (example)
P & D Reduction: 10-20%
```

Useful if aircraft too aggressive at high speeds.

### Dynamic Notch Tuning

For specific resonance frequencies:

1. Review blackbox gyro FFT
2. Identify peaks
3. Adjust dynamic notch:
   - Q value
   - Min/Max frequency
   - Number of notches

## Betaflight Autotune

If available in your firmware:

1. Enable autotune mode on switch
2. Fly in open area
3. Activate autotune
4. Follow prompts (aircraft will move on its own)
5. Land when complete
6. **Review results** before saving

:::warning Autotune Risks
Autotune can produce aggressive settings. Always test in a safe area and be ready to take manual control if behavior is unsafe.
:::

## Flight Log Review

After each tuning session:

1. Download blackbox log
2. Open in Blackbox Explorer
3. Check:
   - Gyro noise levels
   - PID tracking (setpoint vs actual)
   - Motor outputs (balanced?)
   - Filter effectiveness

4. Make ONE adjustment based on data
5. Test fly again
6. Repeat until optimal

## Optimization Goals

You've achieved a good tune when:

- Motors warm but not hot (under 70°C)
- No oscillations in any flight regime
- Responsive to inputs without overshoot
- Clean video (no jello)
- Efficient cruise (low mAh/km)
- Stable GPS rescue behavior

## Maintenance Tuning

Re-check tune every:

- **50 flights**: General tune verification
- **After repairs**: Especially arm or motor replacement
- **Firmware update**: May change filter/PID behavior
- **Configuration change**: Props, battery, or payload changes

## Next Steps

With a well-tuned aircraft:

1. **Log your tune**: Document PIDs and settings for your variant
2. **Share experience**: Help the community with your findings
3. **Explore capabilities**: Test range, flight time, payload
4. **Plan upgrades**: Consider variant modifications

For ongoing issues, see [Troubleshooting](/docs/build-guides/troubleshooting).

---

**Happy flying!**

