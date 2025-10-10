---
sidebar_position: 6
---

# Firmware Configuration

Complete flight controller setup for Betaflight and INAV.

![Power Button](/img/drone/On_button_animation.gif)

## Betaflight Configuration

### Initial Setup

#### 1. Flash Firmware

1. Connect FC via USB
2. Open Betaflight Configurator
3. Select your **FC target** (check FC label)
4. Flash **latest stable** release
5. Perform **full chip erase** on first install

#### 2. Port Configuration

Navigate to **Ports** tab:

| UART | Function | Baud Rate | Notes |
|------|----------|-----------|-------|
| UART1 | GPS | 115200 | RX/TX crossed to GPS |
| UART2 | Receiver | Serial (AUTO) | ELRS/CRSF |
| UART3 | VTX (MSP) | 115200 | If using MSP control |
| UART6 | ESC Telemetry | AUTO | For RPM filter |

:::tip ESC Telemetry
Enabling ESC telemetry (bidirectional DShot) is **critical** for RPM filtering. This dramatically reduces motor heat and improves tune.
:::

#### 3. Configuration Tab

Set basic parameters:

```
Craft Name: Replicant-GEN1
Motor Protocol: DSHOT600
ESC/Motor Features:
  ✓ Bidirectional DShot
  ✓ Motor Stop
Mixer: Quad X
```

#### 4. Motor Order Verification

**Props OFF - Safety Critical!**

In **Motors** tab, test at **10% throttle**:

```
M1 = Front Left (CCW)
M2 = Front Right (CW)
M3 = Rear Right (CCW)
M4 = Rear Left (CW)
```

Verify each motor:
1. Spins when commanded
2. Correct rotation direction
3. No unusual sounds
4. Cool to touch after 30s

:::danger Props OFF for Testing
NEVER install propellers until ALL bench testing is complete. Propellers can cause serious injury.
:::

### Filter Configuration

Navigate to **PID Tuning** tab → **Filter Settings**:

#### Recommended Starting Points

```
Gyro Filter:
  - Gyro Lowpass 1: 250Hz (PT1)
  - Gyro Lowpass 2: 500Hz (PT1)

Dynamic Notch Filter:
  - Enable: ON
  - Width: 8% (default)
  - Q: 120
  - Min/Max: 100-500 Hz

RPM Filter (requires bidir DShot):
  - Enable: ON
  - Harmonics: 3
  - Min: 100 Hz
```

:::info RPM Filtering
RPM filtering is the most effective way to reduce motor heat and noise. Ensure ESC telemetry is working before enabling.
:::

### PID Tuning

Start with a **7-8" Long Range preset** if available:

```
Default Starting PIDs (example):
P: 45-55
I: 80-90
D: 35-45
FF: 70-90
```

**Fine-tuning:**
- If motors hot: Reduce D by 10-15%
- If floaty: Increase P slightly
- If oscillations: Reduce P and D together

See [Tuning Guide](/docs/build-guides/tuning) for detailed procedures.

### Failsafe Configuration

Navigate to **Failsafe** tab:

#### Option 1: GPS Rescue (Recommended)

```
Stage 1: GPS Rescue
Stage 2: Drop (if GPS fails)

GPS Rescue Settings:
  - Angle: 30-40°
  - Initial Climb: 10-15m
  - Descent Rate: 150 cm/s
  - Ground Speed: 3-5 m/s
  - Sanity Checks: ON
```

:::warning Test GPS Rescue
Test in a large, clear area at altitude before relying on it. Land manually first few times to verify behavior.
:::

#### Option 2: Simple Drop

```
Stage 1: Drop (disarm)

Settings:
  - Throttle: 1000µs (motors off)
```

### Receiver Configuration

Navigate to **Receiver** tab:

**ELRS Setup:**
```
Protocol: CRSF
Telemetry: ON
RSSI Channel: AUX12 (or as configured)
Stick Center: 1500
Stick Range: 1000-2000
```

**Test all channels** before first flight!

### Modes Configuration

Recommended mode switches:

| Mode | Function | When to Use |
|------|----------|------------|
| **ARM** | Enable motors | Always on dedicated switch |
| **Angle** | Self-leveling | For beginners or GPS rescue |
| **Horizon** | Limited self-leveling | For cinematic shots |
| **GPS Rescue** | Auto return-to-home | Emergency failsafe |
| **Beeper** | Find lost aircraft | After crashes |
| **Blackbox** | Logging | For tuning flights |

### OSD Configuration

Essential OSD elements:

```
Top Row:
  - Battery voltage (average cell)
  - Current draw

Center (warnings area):
  - ARMED indicator
  - GPS satellites (if using GPS)
  - Failsafe warnings

Bottom Row:
  - RSSI/LQ
  - Flight time
  - mAh used

Persistent:
  - Craft name
  - Artificial horizon (optional)
  - GPS home arrow (if using GPS rescue)
```

### GPS Configuration

If using GPS for rescue/telemetry:

```
GPS Provider: UBLOX (for M10/M8)
Auto Baud: ON
Auto Config: ON
UBLOX SBAS: AUTO
Home Reset: Each Arm
```

**Compass:**
```
Magnetometer: ON
Compass Orientation: As mounted (typically CW0, CW90, etc.)
```

## INAV Configuration

For navigation-focused builds (waypoints, missions):

### 1. Flash & Reset

1. Flash **INAV stable** for your target
2. Full settings reset
3. Load **7-8" Long Range preset** if available

### 2. Key Differences from Betaflight

- **Navigation modes**: Position Hold, RTH, Waypoint
- **Autotune**: Built-in automatic tuning
- **Altitude Hold**: Requires barometer
- **Missions**: Pre-programmed flight paths

### 3. Calibration

Critical for INAV:

1. **Accelerometer calibration**:
   - Place on level surface
   - Run calibration
   - Do NOT move during process

2. **Compass calibration**:
   - Outdoor, away from metal/electronics
   - Rotate aircraft on all axes
   - Verify heading matches actual direction

3. **Autotune** (after maiden flight):
   - Enable autotune mode
   - Fly gentle circuits for 2-3 minutes
   - Land and save settings

### 4. Navigation Setup

```
GPS Settings:
  - Provider: UBLOX
  - Ground Test Fix: ≥8 satellites
  - HDOP: under 1.5

RTH Settings:
  - Altitude: 30-50m
  - Climb First: ON
  - Return Speed: 3-5 m/s
  - Land Speed: 50 cm/s
```

:::warning RTH Testing
Test Return-to-Home at low altitude in a clear area before trusting it at range. Verify it climbs, returns, and descends properly.
:::

## CLI Quick Reference

### Essential Betaflight CLI Commands

```bash
# Show current status
status

# Save settings
save

# Reset to defaults
defaults nosave

# Motor protocol
set motor_pwm_protocol = DSHOT600
set dshot_bidir = ON

# Filters
set rpm_filter_harmonics = 3
set dyn_notch_width_percent = 8

# GPS
feature GPS
set gps_provider = UBLOX
set gps_sbas_mode = AUTO

# Safety
set small_angle = 180

# Save and reboot
save
```

### Useful Diagnostic Commands

```bash
# Check gyro noise
get gyro

# Motor output test
motor 0  # All motors stopped
motor 1 1050  # Test motor 1 at low throttle

# GPS status
gpspassthrough
```

## Pre-Flight Firmware Checklist

Before maiden flight:

- [ ] **Motor order verified** (props off test)
- [ ] **Motor direction correct** (props off test)
- [ ] **Receiver binding** complete and tested
- [ ] **Failsafe set** and tested (pull RX antenna)
- [ ] **GPS fix achieved** (≥8 satellites, HDOP under 1.5)
- [ ] **Compass heading** matches actual direction
- [ ] **Modes configured** and switches tested
- [ ] **OSD displaying** correct telemetry
- [ ] **Blackbox enabled** for maiden flight
- [ ] **Arm switch works** (with props OFF)

## Advanced Features

### RPM-Based Filtering

Requires ESC telemetry:

1. Enable bidirectional DShot on ESC
2. Configure telemetry UART on FC
3. Verify RPM data in OSD or CLI
4. Enable RPM filter
5. Set harmonics (usually 3)

**Benefits:**
- Cleaner gyro signal
- Cooler motors
- Better tune capability
- Less filter delay

### Dynamic Idle

Prevents motor desync on rapid throttle changes:

```
set dyn_idle_min_rpm = 35
set dyn_idle_p_gain = 40
set dyn_idle_i_gain = 40
set dyn_idle_d_gain = 40
```

## Firmware Update Process

Keep firmware current for bug fixes and features:

1. **Backup CLI dump** (`dump all`)
2. Flash new version
3. Re-apply settings from CLI dump
4. Verify all functions work
5. Re-calibrate accelerometer
6. Test bench before flight

## Common Firmware Issues

### Won't Arm

Check `status` in CLI:

- **Gyro cal required**: Place level and wait 5s
- **Throttle too high**: Lower throttle stick
- **Bad RX**: Check receiver connection
- **Angle too steep**: `set small_angle = 180`

### Poor Flight Characteristics

- **Oscillations**: Lower D-gain
- **Sluggish**: Increase P-gain
- **Tail wobble**: Check motor 4, increase D on yaw
- **Prop wash**: Increase I-gain slightly

See [Troubleshooting Guide](/docs/build-guides/troubleshooting) for more solutions.

## Next Steps

With firmware configured, proceed to [Tuning & Maiden Flight](/docs/build-guides/tuning).

