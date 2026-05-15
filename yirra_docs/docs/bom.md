---
sidebar_position: 2
title: Parts List
---

import ImageToggle from '@site/src/components/ImageToggle';
import PurchaseButton from '@site/src/components/PurchaseButton';
import ProductCard from '@site/src/components/ProductCard';
import BomChecklist from '@site/src/components/BomChecklist';
import SupplementalLipoBracketCta, {
  SUPPLEMENTAL_LIPO_BRACKET_PRODUCT_URL,
} from '@site/src/components/SupplementalLipoBracketCta';
import CommercialProgramsPipeline from '@site/src/components/CommercialProgramsPipeline';

# Bill of Materials

Components you need to buy for the **Replicant GEN 1** build.

:::tip 🎯 Yirra Custom Parts Bundle Available
**New to building drones?** Get all Yirra custom components in one package with our **Replicant Release Bundle** — includes carbon plates (top, bottom, spine), battery pack, power management board, and complete fastener kit.

Perfect for first-time builders. You'll still need to source off-the-shelf electronics separately (FC/ESC, motors, props, etc).

<div style={{ maxWidth: '320px', margin: '16px 0' }}>
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', border: '2px solid #3b82f6', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/Products/Bundle.png" alt="Replicant Release Bundle" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>CUSTOM PARTS BUNDLE</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Replicant Release Bundle</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>All Yirra custom parts: carbon plates, battery, PMB, and fasteners</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$369</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_TqcqCXEB6vE8m6" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_TqcqCXEB6vE8m6" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy Bundle</a>
    </div>
  </div>
</div>
:::

:::info Open Source vs. Purchased Components
**The Replicant airframe is fully open source** — all 3D printed parts, CAD files, and design documentation are freely available for you to modify, print, and build.

**Some components must be purchased:**
- **Battery System** — Proprietary cell pack design. Requires controlled cell sourcing and spot welding. *Want a standard hardcase LiPo instead?* Use the **supplemental rail bracket** (STL or printed) — see the [Battery](/docs/battery) page or the store listing below.
- **Power Management Board** — Closed source hardware/firmware. Contains safety-critical logic for intelligent arm/disarm behavior.

**Files provided, buy or DIY:**
- **Carbon fiber plates** — DXF files included if you want to source elsewhere
- **Fastener kit** — Full specs provided, buy ours or source your own

This isn't gatekeeping — battery packs are a liability if done wrong, and the PMB firmware is our secret sauce.

**Scaling production or need OEM terms?** See **[Commercial programs](/docs/commercial-programs)** (volume pricing, licensing, integration).
:::

---

## Electronics Stack

| Component | Qty | Open Source | Notes |
|-----------|-----|-------------|-------|
| **Iflight Borg stack or e55/s** | 1 | N/A (off-shelf) | Flight controller + ESC combo. |
| **BLITZ E55S-4IN1-R4 ESC** | 1 | N/A (off-shelf) | Electronic speed controller reference. |
| **Mico air GPS (M10G-5883)** | 1 | N/A (off-shelf) | GPS module with UART connection. |
| **DJI O4 Pro Air Unit** | 1 | N/A (off-shelf) | HD video transmission system. |
| **DJI O4 Pro Camera** | 1 | N/A (off-shelf) | Camera module for the O4 system. |
| **Matek true diversity ELRS Receiver** | 1 | N/A (off-shelf) | ELRS receiver with true diversity. |
| **Power Management Board** | 1 | **No** — Purchase | Power distribution and management. <PurchaseButton href="https://yirrasystems.com/product/prod_T4TaxIrK5JjUMI" variant="inline">Buy</PurchaseButton> |
| **Arm/Disarm Button** | 1 | N/A (off-shelf) | 12mm momentary push button with green LED. <PurchaseButton href="https://www.aliexpress.com/item/1005007422880341.html" variant="inline">Buy</PurchaseButton> |

### Power Management Board

Custom PCB that handles power distribution, voltage regulation, and battery monitoring for the Replicant platform.

![Power Management Board](/img/drone/Power_managementPCB.png)

### BLITZ E55S-4IN1-R4 ESC & Iflight Borg Stack (20x20)

Choose between these two electronic speed controller options for your Replicant build:

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', margin: '24px 0' }}>
  <div>
    <h4>BLITZ E55S-4IN1-R4 ESC</h4>
    <img src="/img/drone/BLITZ-E55S-4IN1-R4.png" alt="BLITZ E55S-4IN1-R4 ESC" style={{ width: '100%', borderRadius: '8px' }} />
    <p style={{ fontSize: '14px', marginTop: '8px' }}>High-performance 4-in-1 ESC for 7-inch platforms</p>
  </div>
  <div>
    <h4>Iflight Borg Stack (20x20)</h4>
    <img src="/img/drone/Borg.png" alt="Iflight Borg Stack" style={{ width: '100%', borderRadius: '8px' }} />
    <p style={{ fontSize: '14px', marginTop: '8px' }}>Recommended 20x20 flight controller + ESC combo</p>
  </div>
</div>

### Arm/Disarm Button

12mm momentary push button with integrated green LED indicator. Provides tactile feedback for arming/disarming the drone.

| Specification | Value |
|---------------|-------|
| **Diameter** | 12mm |
| **Type** | Momentary push button |
| **LED Color** | Green |
| **Voltage Range** | 12-24V |
| **Mounting** | Panel mount |
| **Switch Rating** | 50mA @ 24VDC |

:::info Button Behavior
The button uses a microcontroller for intelligent operation: press and hold for 2 seconds to arm, shorter hold to disarm. This prevents accidental disarming during flight.
:::

---

## Antennas & Cables

| Component | Qty | Notes |
|-----------|-----|-------|
| **SMA Male to Dual u.FL/IPX (MHF4) Y-Splitter Cable Assembly** | 1 | Length 100mm |
| **SMA Male right angle to Dual u.FL/IPX (MHF4) Y-Splitter Cable Assembly** | 1 | Length 250mm |
| **Vaxis Dual Cavs Antenna 5.8Ghz and 2.4Ghz** | 2 | Or True RC DUALITY 2.4/5.8 STUBBY |
| **200mm 10-12 gauge silicon copper cable** | 1 | For power distribution |

---

## Carbon Fiber Parts

Cut carbon fiber plates. These are **not 3D printed**.

| Part | Qty | Open Source | Specification | Purchase |
|------|-----|-------------|---------------|----------|
| **Top Plate** | 1 | **Yes** — DXF provided | CNC machined 3mm carbon fiber | <PurchaseButton href="https://yirrasystems.com/product/prod_SUaQiz6E625P9V" variant="inline">Buy</PurchaseButton> |
| **Bottom Plate** | 1 | **Yes** — DXF provided | CNC machined 2mm carbon fiber | <PurchaseButton href="https://yirrasystems.com/product/prod_SUaVaLa36ydpSg" variant="inline">Buy</PurchaseButton> |
| **Spine** | 1 | **Yes** — DXF provided | CNC machined 4mm carbon fiber | <PurchaseButton href="https://yirrasystems.com/product/prod_SUaZIcnKA0qSXg" variant="inline">Buy</PurchaseButton> |

---

## Carbon Tubes

| Platform | Component | Qty | Front Arm Length | Rear Arm Length |
|----------|-----------|-----|------------------|-----------------|
| 6 inch | Carbon Tubes | 4 | 93mm | 118mm |
| 7 inch | Carbon Tubes | 4 | 105mm | 134mm |
| 8 inch | Carbon Tubes | 4 | 133mm | 157mm |

---

## Fastener BOM

Complete hardware kit for Replicant GEN 1 assembly. All fasteners are metric with standard pitches.

<div style={{ maxWidth: '320px', margin: '24px 0' }}>
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/Products/Fasteners.webp" alt="Fastener Kit" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>DRONE-PART</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Replicant Fastener Kit</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>Complete fastener kit for the Replicant drone</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$25</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#1f2937', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy now</a>
    </div>
  </div>
</div>

<div style={{ margin: '2rem 0' }}>
  <video 
    controls 
    loop 
    muted 
    playsInline
    style={{ 
      width: '100%', 
      maxWidth: '800px', 
      borderRadius: '12px',
      border: '1px solid #262626'
    }}
  >
    <source src="/videos/RE.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', margin: '24px 0' }}>
  <ImageToggle
    solidImage="/img/Fastener BOM/Drone_solid.png"
    hiddenLineImage="/img/Fastener BOM/Drone_no_hide.png"
    altText="Drone Assembly"
    title="Drone Assembly View"
  />
  <ImageToggle
    solidImage="/img/Fastener BOM/Fasteners_solid.png"
    hiddenLineImage="/img/Fastener BOM/Fasteners_no_hide.png"
    altText="Fastener Details"
    title="Fastener Callout View"
  />
</div>


### Hardware BOM (Grouped by fastener class)

#### Standoffs / Spacers

| Item No | Qty | Type / Spec                     | Length | Material | Finish | Strength class | Purpose                               |
| ------: | --: | ------------------------------- | ------ | -------- | ------ | -------------- | ------------------------------------- |
|       1 |   2 | Aluminum standoff (per drawing) | —      | Aluminum | —      | —              | Nose cone standoffs                   |
|       2 |   5 | Brass standoff (per drawing)    | —      | Brass    | —      | —              | Arm mount standoffs (higher strength) |

---

#### Heatset Inserts

| Item No | Qty | Type / Spec                     | Length | Material | Finish | Strength class | Purpose                               |
| ------: | --: | ------------------------------- | ------ | -------- | ------ | -------------- | ------------------------------------- |
|      19 |  10 | M3 Heatset Insert               | —      | Brass    | —      | —              | Mounting the arms and flight stack    |

---

#### Thread-forming screws for plastic — Delta PT® (M3)

Use **M3×16** arm-boss screws for a **30×30** FC stack and **M3×25** for a **20×20** stack (same locations, different lengths).

| Item No | Qty | Type / Spec                            | Length | Material           | Finish | Strength class | Purpose                                                 |
| ------: | --: | -------------------------------------- | ------ | ------------------ | ------ | -------------- | ------------------------------------------------------- |
|       5 |   2 | Delta PT® **M3×10**, countersunk, Torx | 10mm   | Heat-treated steel | Black  | PT10           | Fastens the XT60 to the battery rail                    |
|       9 |   2 | Delta PT® **M3×30**, low head, Torx    | 30mm   | Heat-treated steel | Black  | PT10           | Angled fasteners mounting the battery rail to the drone |
|      10 |   4 | Delta PT® **M3×16**, countersunk, Torx | 16mm   | Heat-treated steel | Black  | PT10           | Arm boss — **30×30** stack only                         |
|       — |   4 | Delta PT® **M3×25**, countersunk, Torx | 25mm   | Heat-treated steel | Black  | PT10           | Arm boss — **20×20** stack only                         |

---

#### Low head Torx machine screws — ISO 14580 (M3)

**20×20 stack:** use **M3×25** below. **30×30 stack:** use **M3×35** for the same callouts (items 7 + 8) — extra length for the taller stack.

| Item No | Qty | Type / Spec                                        | Length | Material    | Finish | Strength class | Purpose                                |
| ------: | --: | -------------------------------------------------- | ------ | ----------- | ------ | -------------- | -------------------------------------- |
|       7 |   1 | ISO 14580 **M3×25**, low head Torx (machine screw) | 25mm   | Alloy steel | Black  | 12.9           | Spine toward rear — **20×20** stack    |
|       8 |   4 | ISO 14580 **M3×25**, low head Torx (machine screw) | 25mm   | Alloy steel | Black  | 12.9           | Bottom arm mounting — **20×20** stack  |
|       7 |   1 | ISO 14580 **M3×35**, low head Torx (machine screw) | 35mm   | Alloy steel | Black  | 12.9           | Spine toward rear — **30×30** stack    |
|       8 |   4 | ISO 14580 **M3×35**, low head Torx (machine screw) | 35mm   | Alloy steel | Black  | 12.9           | Bottom arm mounting — **30×30** stack  |
|      18 | (opt) | ISO 14580 **M3×35**, low head Torx (machine screw) | 35mm  | Alloy steel | Black  | 12.9           | Stack + motor mount — **30×30** stack  |
|      17 |   1 | ISO 14580 **M3×8**, low head Torx (machine screw)  | 8mm    | Alloy steel | Black  | 12.9           | Secures the front of the top cover      |

---

#### Button head socket machine screws — ISO 7380 (M3)

| Item No |   Qty | Type / Spec                            | Length | Material                                        | Finish       | Strength class | Purpose                                                             |
| ------: | ----: | -------------------------------------- | ------ | ----------------------------------------------- | ------------ | -------------- | ------------------------------------------------------------------- |
|      11 |    16 | ISO 7380 **M3×10**, button head socket | 10mm   | Alloy steel                                     | Black        | 12.9           | Motor mounting screws                                               |
|      12 |     2 | ISO 7380 **M3×10**, button head socket | 10mm   | Alloy steel                                     | Black        | 12.9           | Rear battery rail mounting screws                                   |
|      13 |     4 | ISO 7380 **M3×10**, button head socket | 10mm   | Alloy steel                                     | Black        | 12.9           | Nose cone mounting screws                                           |
|      14 |     2 | ISO 7380 **M3×14**, button head socket | 14mm   | Titanium                                        | Natural      | —              | Forward spine mounting screws                                       |
|      15 |     1 | ISO 7380 **M3×16**, button head socket | 16mm   | Alloy steel                                     | Black        | 12.9           | Rear spine standoff retaining screw                                 |
|      16 |     4 | ISO 7380 **M3×18**, button head socket | 18mm   | Alloy steel                                     | Black        | 12.9           | Arm mount — **20×20** stack only (clears stack height)             |
|      20 |     4 | ISO 7380 **M3×12**, button head socket | 12mm   | Alloy steel                                     | Black        | 12.9           | Front top plate arm mounts                                          |

---

#### Socket cap screws — M2 electronics / camera

| Item No | Qty | Type / Spec                                 | Length | Material    | Finish | Strength class | Purpose                                   |
| ------: | --: | ------------------------------------------- | ------ | ----------- | ------ | -------------- | ----------------------------------------- |
|       3 |   2 | **M2×10** socket cap head *(from ISHCS0210)* | 10mm   | Alloy steel | Black  | 12.9           | Mounts the Power Distribution Board       |
|       4 |   4 | **M2×12** socket cap head *(from ISHCS0212)* | 12mm   | Alloy steel | Black  | 12.9           | Mounts the O4 Pro Air Unit                |
|       6 |   4 | ISO 14579 **M2×8**, Torx socket cap head    | 8mm    | Alloy steel | Black  | 12.9           | Mounts the O4 Pro camera to the nose cone |

---

#### Nuts

| Item No | Qty | Type / Spec                         | Length | Material | Finish | Strength class | Purpose           |
| ------: | --: | ----------------------------------- | ------ | -------- | ------ | -------------- | ----------------- |
|      18 |   4 | **M5 nyloc locknut** (nylon insert) | —      | Aluminum | —      | Class 8 (typ)  | Prop mounting nut |

---

## Adhesives

| Product | Qty | Use |
|---------|-----|-----|
| **3M DP-409** | 1 | Structural epoxy for arm bonding. Alternative: Gorilla 2-Part Epoxy, Pattex Epoxy, UHU Plus, Loctite Epoxy |
| **Loctite 243** | 1 | Medium threadlocker for motor bolts |
| **CA Glue** | 1 | Touch-up and small repairs |

---

## Motors & Props

| Component | Qty | Specification |
|-----------|-----|---------------|
| **Motors** | 4 | 2806.5 1300-1500KV or similar 7" motors |
| **Propellers** | 4 | 6-8 inch props |

---

## Battery

| Component | Qty | Open Source | Specification |
|-----------|-----|-------------|---------------|
| **6S Modular Battery Pack** | 1 | **No** — Purchase | 5000mAh, Eve 50 PL cells in custom rail-mount enclosure |
| **LiPo supplemental rail bracket** | 0–1 | **STL purchase** (or buy printed) | Optional: mounts a **standard hardcase 6S** on the same rail if you skip the Yirra pack. <PurchaseButton href={SUPPLEMENTAL_LIPO_BRACKET_PRODUCT_URL} variant="inline">Store</PurchaseButton> |

:::warning Battery System is Not Open Source
The battery pack is a proprietary design requiring spot-welded Eve 50 PL cells and custom 3D printed enclosure. For safety reasons, we do not provide files to build your own — improper cell handling or welding can result in fire or injury.
:::

<SupplementalLipoBracketCta />

<CommercialProgramsPipeline />

![Battery connector](/img/drone/battery_connector_iso.png)

---

## Purchaseable Parts

:::tip What You Must Buy vs. What You Can DIY
| Category | Status |
|----------|--------|
| **Battery Pack** | Must purchase from Yirra — not open source |
| **Power Management Board** | Must purchase from Yirra — not open source |
| **Carbon Plates & Spine** | DXF files provided — buy from us or cut your own |
| **Fastener Kit** | Full specs provided — buy from us or source yourself |
| **3D Printed Parts** | Fully open source — STEP/3MF files available |
:::

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', margin: '24px 0' }}>
  {/* Release Bundle - Featured */}
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', overflow: 'hidden', border: '2px solid #3b82f6', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/Products/Bundle.png" alt="Replicant Release Bundle" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>CUSTOM PARTS BUNDLE</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Replicant Release Bundle</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>All Yirra custom parts: carbon plates, battery, PMB, and fasteners</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$369</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_TqcqCXEB6vE8m6" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_TqcqCXEB6vE8m6" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy Bundle</a>
    </div>
  </div>

  {/* Fastener Kit */}
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/Products/Fasteners.webp" alt="Fastener Kit" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>DRONE-PART</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Replicant Fastener kit</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>Complete fastener kit for the replicant drone</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$25</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#1f2937', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy now</a>
    </div>
  </div>

  {/* Power Management Board */}
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/drone/Power_managementPCB.png" alt="Power Management Board" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>DRONE-PART</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Power management board</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>Power management board. This is what makes the power button work.</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$80</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_T4TaxIrK5JjUMI" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_T4TaxIrK5JjUMI" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#1f2937', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy now</a>
    </div>
  </div>

  {/* Replicant Exospine */}
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/Products/Exo_spine.JPG" alt="Exospine" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>DRONE-PART</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Replicant Exospine</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>Spine reinforcement plate.</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$27</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_SUaZIcnKA0qSXg" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_SUaZIcnKA0qSXg" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#1f2937', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy now</a>
    </div>
  </div>

  {/* Replicant Carbon Bottom plate */}
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/Products/Bottom_plate.JPG" alt="Bottom Plate" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>DRONE-PART</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Replicant Carbon Bottom plate</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>Bottom reinforcement plate for the IC-01 drone</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$23</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_SUaVaLa36ydpSg" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_SUaVaLa36ydpSg" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#1f2937', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy now</a>
    </div>
  </div>

  {/* Replicant Carbon Top plate */}
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/Products/top_plate.JPG" alt="Top Plate" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>DRONE-PART</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Replicant Carbon Top plate</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>Top reinforcement plate for the IC-01 Chassis</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$25</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_SUaQiz6E625P9V" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_SUaQiz6E625P9V" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#1f2937', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy now</a>
    </div>
  </div>

  {/* 6S Modular Battery Pack */}
  <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/img/Products/battery_connector_iso.png" alt="Battery Connector" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>DRONE-PART</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>6S Modular Battery Pack</h3>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '13px', flex: '1', lineHeight: '1.4' }}>Rail Mountable 6S modular Pack for the IC-01 long range drone system</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>$229</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>AUD</div>
        </div>
        <a href="https://yirrasystems.com/product/prod_SR6kjyZnXCaSC0" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>View Details</a>
      </div>
      <a href="https://yirrasystems.com/product/prod_SR6kjyZnXCaSC0" target="_blank" rel="noopener noreferrer" style={{ width: '100%', backgroundColor: '#1f2937', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>🛒 Buy now</a>
    </div>
  </div>
</div>

<BomChecklist />

## Next Steps

1. [CAD Downloads](/docs/downloads) - Get print files
2. [3D Printing](/docs/3d-printing) - Print preparation
3. [Arm Bonding](/docs/arm-bonding) - Start assembly
