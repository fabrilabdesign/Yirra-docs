---
sidebar_position: 6
title: Firmware
---

# iNav Setup

This build runs on **iNav 8.0.1** with MAMBAH743_2022B hardware. Below is the complete configuration dump for the Replicant GEN 1.

---

## Hardware Target

| Setting | Value |
|---------|-------|
| **Target** | MAMBAH743_2022B |
| **Firmware** | iNav 8.0.1 |
| **Mixer** | Quad X |
| **Motor Protocol** | DSHOT300 |

---

## Complete CLI Configuration

Paste this entire configuration into the iNav CLI after connecting:

```
# version
# INAV/MAMBAH743_2022B 8.0.1 Feb 25 2025 / 10:33:45 (171d00bb)
# GCC-13.2.1 20231009

# start the command batch
batch start

# reset configuration to default settings
defaults noreboot

# resources

# Timer overrides
timer_output_mode 2 SERVOS

# Outputs [servo]

# safehome

# Fixed Wing Approach
fwapproach 8 6000 500 0 0 0 0

# geozone

# geozone vertices

# features
feature GPS
feature PWM_OUTPUT_ENABLE

# beeper

# blackbox
blackbox NAV_ACC
blackbox NAV_POS
blackbox NAV_PID
blackbox MAG
blackbox ACC
blackbox ATTI
blackbox RC_DATA
blackbox RC_COMMAND
blackbox MOTORS
blackbox GYRO_RAW
blackbox PEAKS_R
blackbox PEAKS_P
blackbox PEAKS_Y
blackbox SERVOS

# Receiver: Channel map

# Ports
serial 1 2 115200 115200 0 115200
serial 2 33554432 115200 115200 0 115200
serial 6 1 115200 115200 0 115200

# LEDs

# LED color

# LED mode_color

# Modes [aux]
aux 0 0 0 1950 2050
aux 1 1 3 950 1050
aux 2 11 1 950 1050
aux 3 10 2 1950 2050
aux 4 28 6 950 1050
aux 5 30 7 1950 2050
aux 6 48 5 950 1050

# Adjustments [adjrange]

# Receiver rxrange

# temp_sensor

# Mission Control Waypoints [wp]
#wp 0 invalid

# OSD [osd_layout]
osd_layout 0 0 44 17 V
osd_layout 0 1 7 0 H
osd_layout 0 2 0 0 V
osd_layout 0 3 8 6 V
osd_layout 0 4 8 6 V
osd_layout 0 7 25 19 V
osd_layout 0 9 41 0 H
osd_layout 0 11 6 6 H
osd_layout 0 12 6 5 H
osd_layout 0 14 17 0 V
osd_layout 0 15 26 0 H
osd_layout 0 22 26 0 V
osd_layout 0 23 28 0 V
osd_layout 0 28 6 19 V
osd_layout 0 30 13 16 V
osd_layout 0 32 7 0 V
osd_layout 0 37 6 4 H
osd_layout 0 38 7 1 V
osd_layout 0 40 26 0 H
osd_layout 0 85 41 0 V
osd_layout 0 86 39 4 V
osd_layout 0 87 39 3 V
osd_layout 0 166 23 0 H
osd_layout 1 0 12 0 H
osd_layout 1 1 0 0 H
osd_layout 1 2 8 6 H
osd_layout 1 4 23 8 H
osd_layout 1 5 23 9 H
osd_layout 1 6 13 12 H
osd_layout 1 7 20 2 H
osd_layout 1 8 1 2 H
osd_layout 1 9 8 6 H
osd_layout 1 10 2 3 H
osd_layout 1 11 1 4 H
osd_layout 1 12 23 1 H
osd_layout 1 13 0 11 H
osd_layout 1 14 1 0 H
osd_layout 1 15 2 10 H
osd_layout 1 16 2 11 H
osd_layout 1 17 2 12 H
osd_layout 1 18 15 1 H
osd_layout 1 19 18 12 H
osd_layout 1 20 0 12 H
osd_layout 1 21 14 11 H
osd_layout 1 22 1 1 H
osd_layout 1 23 12 2 H
osd_layout 1 24 23 5 H
osd_layout 1 25 24 7 H
osd_layout 1 26 3 5 H
osd_layout 1 27 23 11 H
osd_layout 1 28 23 12 H
osd_layout 1 29 1 13 H
osd_layout 1 30 0 10 H
osd_layout 1 31 12 1 H
osd_layout 1 32 6 2 H
osd_layout 1 33 18 2 H
osd_layout 1 34 1 5 H
osd_layout 1 36 1 6 H
osd_layout 1 37 1 7 H
osd_layout 1 38 1 5 H
osd_layout 1 39 1 2 H
osd_layout 1 40 1 8 H
osd_layout 1 41 1 7 H
osd_layout 1 42 0 0 H
osd_layout 1 45 3 6 H
osd_layout 1 46 3 7 H
osd_layout 1 47 23 7 H
osd_layout 1 48 23 6 H
osd_layout 1 49 0 0 H
osd_layout 1 50 12 2 H
osd_layout 1 52 12 1 H
osd_layout 1 54 1 8 H
osd_layout 1 55 2 12 H
osd_layout 1 61 2 10 H
osd_layout 1 62 2 11 H
osd_layout 1 63 2 12 H
osd_layout 1 77 0 0 H
osd_layout 1 78 2 12 H
osd_layout 1 84 23 1 H
osd_layout 1 85 19 2 H
osd_layout 1 86 19 3 H
osd_layout 1 87 19 4 H
osd_layout 1 88 19 5 H
osd_layout 1 89 19 6 H
osd_layout 1 90 19 7 H
osd_layout 1 91 19 8 H
osd_layout 1 92 19 9 H
osd_layout 1 93 19 10 H
osd_layout 1 94 19 11 H
osd_layout 1 95 0 0 H
osd_layout 1 96 0 12 H
osd_layout 1 97 0 0 H
osd_layout 1 99 12 4 H
osd_layout 1 100 12 5 H
osd_layout 1 101 12 6 H
osd_layout 1 102 12 7 H
osd_layout 1 103 0 0 H
osd_layout 1 104 3 5 H
osd_layout 1 105 1 2 H
osd_layout 1 106 1 3 H
osd_layout 1 107 2 12 H
osd_layout 1 108 23 12 H
osd_layout 1 109 23 10 H
osd_layout 1 110 24 9 H
osd_layout 1 111 24 10 H
osd_layout 1 112 1 1 H
osd_layout 1 113 1 2 H
osd_layout 1 114 1 3 H
osd_layout 1 115 1 4 H
osd_layout 1 116 0 0 H
osd_layout 1 120 3 4 H
osd_layout 1 121 3 5 H
osd_layout 1 122 3 6 H
osd_layout 1 123 23 2 H
osd_layout 1 124 0 0 H
osd_layout 1 128 0 10 H
osd_layout 1 129 2 7 H
osd_layout 1 130 2 8 H
osd_layout 1 131 2 9 H
osd_layout 1 132 2 10 H
osd_layout 1 133 0 0 H
osd_layout 1 139 12 3 H
osd_layout 1 141 20 3 H
osd_layout 1 142 0 0 H
osd_layout 1 143 1 4 H
osd_layout 1 144 1 3 H
osd_layout 1 145 20 3 H
osd_layout 1 146 0 0 H
osd_layout 1 149 2 7 H
osd_layout 1 150 2 8 H
osd_layout 1 151 2 10 H
osd_layout 1 152 0 0 H
osd_layout 1 158 23 11 H
osd_layout 1 159 24 11 H
osd_layout 1 160 24 12 H
osd_layout 1 161 24 13 H
osd_layout 1 162 0 0 H
osd_layout 1 165 23 0 H
osd_layout 1 166 12 0 H
osd_layout 2 0 0 0 H
osd_layout 2 1 8 6 H
osd_layout 2 2 8 6 H
osd_layout 2 3 23 8 H
osd_layout 2 4 23 9 H
osd_layout 2 5 13 12 H
osd_layout 2 6 20 2 H
osd_layout 2 7 1 2 H
osd_layout 2 8 8 6 H
osd_layout 2 9 2 3 H
osd_layout 2 10 1 4 H
osd_layout 2 11 23 1 H
osd_layout 2 12 0 11 H
osd_layout 2 13 1 0 H
osd_layout 2 14 2 10 H
osd_layout 2 15 2 11 H
osd_layout 2 16 2 12 H
osd_layout 2 17 15 1 H
osd_layout 2 18 18 12 H
osd_layout 2 19 0 12 H
osd_layout 2 20 14 11 H
osd_layout 2 21 1 1 H
osd_layout 2 22 12 2 H
osd_layout 2 23 23 5 H
osd_layout 2 24 24 7 H
osd_layout 2 25 3 5 H
osd_layout 2 26 23 11 H
osd_layout 2 27 23 12 H
osd_layout 2 28 1 13 H
osd_layout 2 29 0 10 H
osd_layout 2 30 12 1 H
osd_layout 2 31 6 2 H
osd_layout 2 32 18 2 H
osd_layout 2 33 1 5 H
osd_layout 2 34 1 5 H
osd_layout 2 35 1 6 H
osd_layout 2 36 1 7 H
osd_layout 2 37 1 5 H
osd_layout 2 38 1 2 H
osd_layout 2 39 1 8 H
osd_layout 2 40 1 7 H
osd_layout 2 41 0 0 H
osd_layout 2 42 0 0 H
osd_layout 2 44 3 6 H
osd_layout 2 45 3 7 H
osd_layout 2 46 23 7 H
osd_layout 2 47 23 6 H
osd_layout 2 48 0 0 H
osd_layout 2 49 12 2 H
osd_layout 2 50 12 2 H
osd_layout 2 51 12 1 H
osd_layout 2 52 12 1 H
osd_layout 2 53 1 8 H
osd_layout 2 54 2 12 H
osd_layout 2 55 2 12 H
osd_layout 2 60 2 10 H
osd_layout 2 61 2 11 H
osd_layout 2 62 2 12 H
osd_layout 2 63 2 12 H
osd_layout 2 76 0 0 H
osd_layout 2 78 2 12 H
osd_layout 2 83 23 1 H
osd_layout 2 84 19 2 H
osd_layout 2 85 19 3 H
osd_layout 2 86 19 4 H
osd_layout 2 87 19 5 H
osd_layout 2 88 19 6 H
osd_layout 2 89 19 7 H
osd_layout 2 90 19 8 H
osd_layout 2 91 19 9 H
osd_layout 2 92 19 10 H
osd_layout 2 93 19 11 H
osd_layout 2 94 0 0 H
osd_layout 2 95 0 12 H
osd_layout 2 97 0 0 H
osd_layout 2 98 12 4 H
osd_layout 2 99 12 5 H
osd_layout 2 100 12 6 H
osd_layout 2 101 12 7 H
osd_layout 2 102 0 0 H
osd_layout 2 103 3 5 H
osd_layout 2 104 1 2 H
osd_layout 2 105 1 3 H
osd_layout 2 106 2 12 H
osd_layout 2 107 23 12 H
osd_layout 2 108 23 10 H
osd_layout 2 109 24 9 H
osd_layout 2 110 24 10 H
osd_layout 2 111 1 1 H
osd_layout 2 112 1 2 H
osd_layout 2 113 1 3 H
osd_layout 2 114 1 4 H
osd_layout 2 115 0 0 H
osd_layout 2 116 0 0 H
osd_layout 2 119 3 4 H
osd_layout 2 120 3 5 H
osd_layout 2 121 3 6 H
osd_layout 2 122 23 2 H
osd_layout 2 123 0 0 H
osd_layout 2 124 0 0 H
osd_layout 2 127 0 10 H
osd_layout 2 128 2 7 H
osd_layout 2 129 2 8 H
osd_layout 2 130 2 9 H
osd_layout 2 131 2 10 H
osd_layout 2 132 0 0 H
osd_layout 2 133 0 0 H
osd_layout 2 138 12 3 H
osd_layout 2 139 12 3 H
osd_layout 2 140 20 3 H
osd_layout 2 141 0 0 H
osd_layout 2 142 1 4 H
osd_layout 2 143 1 3 H
osd_layout 2 144 20 3 H
osd_layout 2 145 0 0 H
osd_layout 2 146 0 0 H
osd_layout 2 148 2 7 H
osd_layout 2 149 2 8 H
osd_layout 2 150 2 10 H
osd_layout 2 151 0 0 H
osd_layout 2 152 0 0 H
osd_layout 2 157 23 11 H
osd_layout 2 158 24 11 H
osd_layout 2 159 24 12 H
osd_layout 2 160 24 13 H
osd_layout 2 161 0 0 H
osd_layout 2 162 0 0 H
osd_layout 2 164 23 0 H
osd_layout 2 165 12 0 H
osd_layout 3 0 8 6 H
osd_layout 3 1 8 6 H
osd_layout 3 2 23 8 H
osd_layout 3 3 23 9 H
osd_layout 3 4 13 12 H
osd_layout 3 5 20 2 H
osd_layout 3 6 1 2 H
osd_layout 3 7 8 6 H
osd_layout 3 8 2 3 H
osd_layout 3 9 1 4 H
osd_layout 3 10 23 1 H
osd_layout 3 11 0 11 H
osd_layout 3 12 1 0 H
osd_layout 3 13 2 10 H
osd_layout 3 14 2 11 H
osd_layout 3 15 2 12 H
osd_layout 3 16 15 1 H
osd_layout 3 17 18 12 H
osd_layout 3 18 0 12 H
osd_layout 3 19 14 11 H
osd_layout 3 20 1 1 H
osd_layout 3 21 12 2 H
osd_layout 3 22 23 5 H
osd_layout 3 23 24 7 H
osd_layout 3 24 3 5 H
osd_layout 3 25 23 11 H
osd_layout 3 26 23 12 H
osd_layout 3 27 1 13 H
osd_layout 3 28 0 10 H
osd_layout 3 29 12 1 H
osd_layout 3 30 6 2 H
osd_layout 3 31 18 2 H
osd_layout 3 32 1 5 H
osd_layout 3 33 1 5 H
osd_layout 3 34 1 6 H
osd_layout 3 35 1 7 H
osd_layout 3 37 1 2 H
osd_layout 3 38 1 8 H
osd_layout 3 39 1 7 H
osd_layout 3 40 0 0 H
osd_layout 3 41 0 0 H
osd_layout 3 42 0 0 H
osd_layout 3 43 3 6 H
osd_layout 3 44 3 7 H
osd_layout 3 45 23 7 H
osd_layout 3 46 23 6 H
osd_layout 3 47 0 0 H
osd_layout 3 48 12 2 H
osd_layout 3 49 12 2 H
osd_layout 3 50 12 1 H
osd_layout 3 51 12 1 H
osd_layout 3 52 1 8 H
osd_layout 3 53 2 12 H
osd_layout 3 54 2 12 H
osd_layout 3 55 2 12 H
osd_layout 3 59 2 10 H
osd_layout 3 60 2 11 H
osd_layout 3 62 2 12 H
osd_layout 3 63 2 12 H
osd_layout 3 75 0 0 H
osd_layout 3 78 2 12 H
osd_layout 3 82 23 1 H
osd_layout 3 83 19 2 H
osd_layout 3 84 19 3 H
osd_layout 3 85 19 4 H
osd_layout 3 86 19 5 H
osd_layout 3 87 19 6 H
osd_layout 3 88 19 7 H
osd_layout 3 89 19 8 H
osd_layout 3 90 19 9 H
osd_layout 3 91 19 10 H
osd_layout 3 92 19 11 H
osd_layout 3 93 0 0 H
osd_layout 3 94 0 12 H
osd_layout 3 95 0 0 H
osd_layout 3 97 12 4 H
osd_layout 3 98 12 5 H
osd_layout 3 99 12 6 H
osd_layout 3 100 12 7 H
osd_layout 3 101 0 0 H
osd_layout 3 102 3 5 H
osd_layout 3 103 1 2 H
osd_layout 3 104 1 3 H
osd_layout 3 105 2 12 H
osd_layout 3 106 23 12 H
osd_layout 3 107 23 10 H
osd_layout 3 108 24 9 H
osd_layout 3 109 24 10 H
osd_layout 3 110 1 1 H
osd_layout 3 111 1 2 H
osd_layout 3 112 1 3 H
osd_layout 3 113 1 4 H
osd_layout 3 114 0 0 H
osd_layout 3 115 0 0 H
osd_layout 3 116 0 0 H
osd_layout 3 118 3 4 H
osd_layout 3 119 3 5 H
osd_layout 3 120 3 6 H
osd_layout 3 121 23 2 H
osd_layout 3 122 0 0 H
osd_layout 3 123 0 0 H
osd_layout 3 124 0 0 H
osd_layout 3 126 0 10 H
osd_layout 3 127 2 7 H
osd_layout 3 128 2 8 H
osd_layout 3 129 2 9 H
osd_layout 3 130 2 10 H
osd_layout 3 131 0 0 H
osd_layout 3 132 0 0 H
osd_layout 3 133 0 0 H
osd_layout 3 137 12 3 H
osd_layout 3 138 12 3 H
osd_layout 3 139 20 3 H
osd_layout 3 140 0 0 H
osd_layout 3 141 1 4 H
osd_layout 3 142 1 3 H
osd_layout 3 143 20 3 H
osd_layout 3 144 0 0 H
osd_layout 3 145 0 0 H
osd_layout 3 146 0 0 H
osd_layout 3 147 2 7 H
osd_layout 3 148 2 8 H
osd_layout 3 149 2 10 H
osd_layout 3 150 0 0 H
osd_layout 3 151 0 0 H
osd_layout 3 152 0 0 H
osd_layout 3 156 23 11 H
osd_layout 3 157 24 11 H
osd_layout 3 158 24 12 H
osd_layout 3 159 24 13 H
osd_layout 3 160 0 0 H
osd_layout 3 161 0 0 H
osd_layout 3 162 0 0 H

# Programming: logic

# Programming: global variables

# Programming: PID controllers

# OSD: custom elements

# master
set gyro_main_lpf_hz = 80
set dynamic_gyro_notch_q = 180
set dynamic_gyro_notch_mode = 3D
set setpoint_kalman_q = 200
set gyro_zero_x = 9
set gyro_zero_y = -1
set ins_gravity_cmss =  973.010
set acc_hardware = ICM42605
set acc_lpf_hz = 10
set acc_lpf_type = PT1
set acczero_x = -5
set acczero_y = 2
set acczero_z = 14
set accgain_x = 4094
set accgain_y = 4092
set accgain_z = 4094
set opflow_scale =  4.215
set align_opflow = CW90FLIP
set align_mag = CW180FLIP
set mag_hardware = QMC5883
set magzero_x = 1161
set magzero_y = -336
set magzero_z = -205
set maggain_x = 1040
set maggain_y = 1314
set maggain_z = 1366
set align_mag_pitch = 1800
set baro_hardware = SPL06
set serialrx_provider = CRSF
set blackbox_rate_denom = 2
set motor_pwm_protocol = DSHOT300
set failsafe_procedure = RTH
set applied_defaults = 5
set rpm_gyro_harmonics = 3
set rpm_gyro_min_hz = 40
set gps_ublox_use_galileo = ON
set gps_ublox_use_beidou = ON
set gps_ublox_use_glonass = ON
set airmode_type = THROTTLE_THRESHOLD
set fw_autotune_max_rate_deflection = 80
set inav_allow_dead_reckoning = ON
set nav_auto_speed = 1800
set nav_max_auto_speed = 2000
set nav_manual_speed = 1800
set nav_max_terrain_follow_alt = 200
set nav_mc_bank_angle = 40
set nav_mc_wp_slowdown = OFF
set osd_video_system = DJI_NATIVE
set osd_speed_source = 3D
set i2c_speed = 800KHZ
set debug_mode = FLOW_RAW
set dshot_beeper_enabled = OFF

# control_profile
control_profile 1

set mc_p_pitch = 55
set mc_i_pitch = 133
set mc_d_pitch = 46
set mc_cd_pitch = 139
set mc_p_roll = 44
set mc_i_roll = 105
set mc_d_roll = 36
set mc_cd_roll = 110
set mc_p_yaw = 42
set mc_i_yaw = 96
set mc_cd_yaw = 90
set dterm_lpf_hz = 55
set nav_mc_pos_xy_p = 55
set nav_mc_vel_xy_p = 35
set nav_mc_vel_xy_i = 12
set nav_mc_vel_xy_d = 130
set nav_mc_vel_xy_ff = 30
set nav_mc_heading_p = 55
set nav_mc_vel_xy_dterm_lpf_hz =  1.500
set nav_mc_vel_xy_dterm_attenuation = 95
set nav_mc_vel_xy_dterm_attenuation_start = 5
set nav_mc_vel_xy_dterm_attenuation_end = 70
set mc_iterm_relax_cutoff = 13
set d_boost_min =  0.750
set d_boost_max =  1.150
set d_boost_max_at_acceleration =  6500.000
set d_boost_gyro_delta_lpf_hz = 75
set antigravity_gain =  2.000
set antigravity_accelerator =  2.000
set antigravity_cutoff_lpf_hz = 10
set mc_cd_lpf_hz = 25
set smith_predictor_strength =  0.550
set smith_predictor_delay =  2.274
set smith_predictor_lpf_hz = 55
set thr_mid = 30
set thr_expo = 50
set tpa_rate = 25
set tpa_breakpoint = 1400
set tpa_on_yaw = ON
set rc_expo = 68
set rc_yaw_expo = 75
set roll_rate = 78
set pitch_rate = 78
set yaw_rate = 58
set ez_filter_hz = 75
set ez_axis_ratio = 127
set ez_response = 120
set ez_damping = 200
set ez_stability = 150
set ez_rate = 90
set ez_snappiness = 30

# control_profile
control_profile 2

set mc_p_pitch = 60
set mc_i_pitch = 140
set mc_d_pitch = 43
set mc_cd_pitch = 160
set mc_p_roll = 48
set mc_i_roll = 110
set mc_d_roll = 34
set mc_cd_roll = 130
set mc_p_yaw = 50
set mc_i_yaw = 100
set mc_cd_yaw = 110
set dterm_lpf_hz = 45
set tpa_rate = 15
set tpa_breakpoint = 1300
set tpa_on_yaw = ON
set rc_expo = 60
set rc_yaw_expo = 60
set roll_rate = 80
set pitch_rate = 80
set yaw_rate = 65

# control_profile
control_profile 3

set tpa_rate = 20
set tpa_breakpoint = 1200
set rc_expo = 75
set rc_yaw_expo = 75
set roll_rate = 70
set pitch_rate = 70
set yaw_rate = 60

# mixer_profile
mixer_profile 1

set model_preview_type = 3
set motorstop_on_low = OFF

# Mixer: motor mixer

mmix reset

mmix 0  1.000 -1.000  1.000 -1.000
mmix 1  1.000 -1.000 -1.000  1.000
mmix 2  1.000  1.000  1.000  1.000
mmix 3  1.000  1.000 -1.000 -1.000

# Mixer: servo mixer
smix reset

smix 0 1 16 -55 70 -1

# mixer_profile
mixer_profile 2

set model_preview_type = 0
set motorstop_on_low = OFF

# Mixer: motor mixer

# Mixer: servo mixer

# battery_profile
battery_profile 1

set bat_cells = 6
set vbat_min_cell_voltage = 300
set vbat_warning_cell_voltage = 300
set nav_mc_hover_thr = 1150

# battery_profile
battery_profile 2


# battery_profile
battery_profile 3


# restore original profile selection
control_profile 1
mixer_profile 1
battery_profile 1

# save configuration
save

#
```

---

## Receiver Setup

Bind your receiver before proceeding. Common setups:

| Receiver | Protocol | UART |
|----------|----------|------|
| ELRS | CRSF | UART1 or UART3 |
| TBS Crossfire | CRSF | UART1 or UART3 |
| FrSky | SBUS | UART2 |

Set in CLI:
```
set serialrx_provider = CRSF
set serialrx_inverted = OFF
```

---

## Motor Order Check

Before first arm:

1. Remove props
2. Connect battery
3. In iNav Configurator → Motors tab
4. Spin each motor individually
5. Verify correct motor (1-4) and direction
6. Correct via CLI if needed: `set motor_direction_inverted = 1,0,1,0`

---

## Sensor Calibration

1. **Accelerometer** - Place on level surface, calibrate
2. **Gyro** - Keep still during calibration
3. **Magnetometer** - Rotate through all axes if using GPS

---

## Arming

Default arm setup:
- Arm switch on AUX1
- Set range in Modes tab
- Verify arming conditions (level, GPS if required)

---

## Pre-Flight Checklist

✅ Props removed for motor test  
✅ Motor direction verified  
✅ Receiver bound and responding  
✅ Accelerometer calibrated  
✅ Failsafe configured  
✅ Arm switch working  

---

## Resources

- [iNav Configurator](https://github.com/iNavFlight/inav-configurator/releases)
- [iNav Wiki](https://github.com/iNavFlight/inav/wiki)
- [iFlight BLITZ Target Info](https://github.com/iNavFlight/inav/blob/master/docs/Board%20-%20IFLIGHT_BLITZ_F7_AIO.md)

---

## Next Steps

1. Complete motor direction check
2. Configure failsafe
3. Test hover (props on, open area)

