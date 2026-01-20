---
sidebar_position: 1
title: Platform Overview
---

import ImageToggle from '@site/src/components/ImageToggle';

# Replicant GEN 1 Platform

![Replicant GEN 1 Platform Hero](/img/drone/Hero_image_comp.jpg)

The Replicant represents a fundamental rethinking of FPV drone design, embracing traditional construction methods, while leaning heavily on 3D printed components for both loaded and case components. Resulting in an extremely light, strong and aerodynamic structure.

---

## Why Redesign the Drone?

FPV drone design has remained largely unchanged since the early 2000s, relying on basic materials and assembly methods. While consumer drones have advanced significantly with sophisticated features and user-friendly designs, the FPV community has been underserved by comparison.

With the huge strides in 3D printing and other manufacturing enablement technologies, and broad uptake of these technologies in the builder community, that needn't be the case.

**The Replicant breaks this mold by:**
- Leveraging modern manufacturing techniques for superior performance
- Prioritizing builder accessibility and repairability
- Delivering professional-grade flight characteristics
- Maintaining open-source philosophy for community advancement

---

## The Catalyst: Intelligent Power Control

![Replicant drone on button detail](/img/drone/On_button_animation.gif)

The Replicant is one of the only drones available today with a dedicated arm/disarm button. We use a microcontroller to provide intelligent button behavior: press and hold for 2 seconds to arm/turn on, shorter hold to disarm/turn off. This prevents accidental disarming during flight while providing tactile feedback for reliable operation.

---

## Rail-Mounted Modular Battery System

Eliminate velcro strap fiddliness with our rail-mounted modular battery system, built with the operator in mind. It allows for rapid, effortless battery swaps while the battery's mass and rigidity enhance flight characteristics and damp vibrations that could otherwise cause jello in your footage.

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', margin: '24px 0' }}>
  <div>
    <img src="/img/drone/Battreryfront_iso.png" alt="Battery front isometric view" />
    <p style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.9em', color: '#666' }}>Front isometric view</p>
  </div>
  <div>
    <img src="/img/drone/battery_connector_iso.png" alt="Battery connector detail" />
    <p style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.9em', color: '#666' }}>Connector detail</p>
  </div>
</div>

### Rapid Battery Swaps: Professional Performance

Our rail-mounted battery system provides secure mounting with rapid swap capability, designed for professional operation where reliability and speed matter.

![Battery removal animation](/img/drone/Battery_removal.gif)

**Battery Specifications:**
- **Cells:** Eve 50 PL in 6S1P configuration
- **Capacity:** 5000mAh per pack
- **Mounting:** Rail-based system for rapid, secure swaps
- **Design:** Single pack configuration optimized for current build

---

## Vibration Mitigation from Day 1

Our nose cone is entirely TPU, effectively isolating normal drone noise, resulting in clean, clear, jello-free footage.

![TPE nose cone vibration isolation](/img/drone/TPE_nose_cone.gif)

**Vibration Control Features:**
- TPU nose cone for acoustic isolation
- Battery mass damping for reduced vibrations
- Carbon fiber construction for rigidity

---

## Aerodynamic Design: Efficiency Through Form

If it flies, it better be aerodynamic. This is not hard, people. The Replicant achieves optimal efficiency through:

- **Tubular arms** for minimal drag
- **Smooth uncluttered top surface** for laminar flow
- **Cutaway exospine** for reduced frontal area
- **Underslung battery system** for balanced weight distribution

![Aerodynamic Replicant drone design](/img/Drone_updates/Low%20Frontal%20area%20=%20low%20drag.png)

### Aerodynamic Improvements

The Replicant GEN 1 features several aerodynamic optimizations designed to reduce drag, improve cooling, and enhance overall flight performance.

#### Front Cooling Duct

The front cooling duct optimizes airflow through the electronics bay, providing efficient cooling while maintaining aerodynamic efficiency.

![Front cooling duct for optimized airflow](/img/Drone_updates/Front%20cooling%20duct%20.png)

#### Stack Ventilation System

The flight controller and ESC stack features both upper and lower ventilation ports for optimal cooling air flow through the electronics bay.

![Upper stack ventilation for electronics cooling](/img/Drone_updates/Upper_stack%20vent.png)

![Lower stack ventilation for heat dissipation](/img/Drone_updates/Lower%20stack%20vent.png)

#### Dorsal Venturi Ducts

These are the dorsal venturi ducts and they forcefully ventilate the stack and O4 Pro during forward flight. They also materially impact a reduction in frontal and wetted area further reducing parasitic losses.

![Dorsal venturi ducts for enhanced ventilation and reduced drag](/img/Drone_updates/Dorsal%20vents.png)

![Additional dorsal venturi duct detail](/img/Drone_updates/Dorsal%20vent%202.png)

These aerodynamic improvements work together to reduce parasitic drag, enhance cooling efficiency, and improve overall flight performance.

---

## Strategic Construction: Strength Where Necessary

We're not married to any particular construction technique. That's why we've used printed components strategically in conjunction with the high specific strength of carbon plates and tubes to achieve the best of both worlds.

![Hybrid construction materials](/img/Drone_updates/Carbon%20where%20it%20counts.png)

**Construction Philosophy:**
- **Carbon Fiber Plates:** High strength-to-weight ratio for structural integrity
- **CF-Nylon Printed Parts:** Optimized for complex geometries and assembly
- **Carbon Tubes:** Superior stiffness for arm construction
- **Modular Design:** Easy maintenance and upgrades

---

## Fully Enclosed Electronics Protection

We're doing away with janky and half-baked exposed internal electronics. We engineered a fully enclosed chassis that protects your drone's delicate and expensive internals, while the tubular arms serve as ideal protective conduits for the motor wiring harness.

![Fully enclosed chassis design](/img/drone/annotated_explode.PNG)

---

## Optimized Antenna Placement

This drone doesn't wear bunny ears—we're changing how drones are packaged and antennas don't escape. We've placed dual Cavalry 2.4 and 5.8GHz antennas on each end of the drone. This was simple, obvious packing optimization spotted during the design phase.

![Integrated antenna design](/img/Drone_updates/GPS_XRAY.png)

---

## Superior GPS Performance

No other drone physically isolates the GPS better than ours. With our underslung battery and uncluttered top surface, we provide unimpeded sky access and below-average EMI exposure. The result? Fast satellite acquisition and reliable GPS performance.

**GPS Performance:**
- 25-30 satellites typically visible
- Lock acquisition in 20 seconds
- Minimal EMI interference
- Optimal sky visibility

---

## Open Source Airframe, Professional Power System

If you crash a drone, the most likely thing you're going to break is your ego. A close second is a drone arm. We want to keep you flying, so we're open-sourcing the Replicant airframe — print it, mod it, fix it.

**What's Open Source:**
- **Complete CAD files** (STEP/3MF) for all 3D printed components
- **DXF files** for carbon fiber plates — cut your own or buy ours
- **Full fastener specifications** — source yourself or buy our kit
- **TPU flexible parts** for vibration dampening
- **Comprehensive build guides** with videos and detailed instructions

**What's Not Open Source:**
- **Battery Pack** — Proprietary design using spot-welded Eve 50 PL cells. We don't release these files for safety reasons — improper cell handling is a fire/injury risk.
- **Power Management Board** — Closed source hardware and firmware. This is our secret sauce for the intelligent arm/disarm behavior and includes safety-critical voltage monitoring.

This isn't about gatekeeping — it's about keeping you safe and keeping the lights on.

**Repair & Modify Freely:**
- Fabricate replacement parts on your 3D printer
- Modify the frame for custom payloads or configurations  
- Build entirely new drone variants from the ground up
- Community-driven development and enhancements

---

## Platform Benefits Summary

**For Builders:**
- Create your own drone frame at home
- Repair damaged drones without ordering parts online
- Customize and optimize for specific applications
- Access to professional-grade flight characteristics

**For Pilots:**
- Reliable, consistent flight performance
- Easy maintenance and upgrades
- Superior video quality with vibration mitigation
- Professional-grade build quality

**For the Community:**
- Open-source design philosophy
- Advanced manufacturing techniques accessible to builders
- Foundation for future drone platform development
- Educational resource for FPV technology

---

## Next Steps

1. [Download CAD Files](/docs/downloads) - Get started with the Replicant platform
2. [Review BOM](/docs/bom) - Understand component requirements
3. [Begin Assembly](/docs/assembly) - Start building your Replicant