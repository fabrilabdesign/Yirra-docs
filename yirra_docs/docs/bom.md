---
sidebar_position: 2
title: Parts List
---

import ImageToggle from '@site/src/components/ImageToggle';
import PurchaseButton from '@site/src/components/PurchaseButton';
import ProductCard from '@site/src/components/ProductCard';

# Bill of Materials

Components you need to buy for the **Replicant GEN 1** build.

---

## Electronics Stack

| Component | Qty | Notes |
|-----------|-----|-------|
| **Iflight Borg stack or e55/s** | 1 | Flight controller + ESC combo. |
| **Mico air GPS (M10G-5883)** | 1 | GPS module with UART connection. |
| **DJI O4 Pro Air Unit** | 1 | HD video transmission system. |
| **DJI O4 Pro Camera** | 1 | Camera module for the O4 system. |
| **Matek true diversity ELRS Receiver** | 1 | ELRS receiver with true diversity. |
| **Power Management Board** | 1 | Power distribution and management. <PurchaseButton href="https://yirrasystems.com/product/prod_T4TaxIrK5JjUMI" variant="inline">Buy</PurchaseButton> |

### Power Management Board

Custom PCB that handles power distribution, voltage regulation, and battery monitoring for the Replicant platform.

![Power Management Board](/img/drone/Power_managementPCB.png)

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

| Part | Qty | Specification | Purchase |
|------|-----|---------------|----------|
| **Top Plate** | 1 | CNC machined 3mm carbon fiber | <PurchaseButton href="https://yirrasystems.com/product/prod_SUaQiz6E625P9V" variant="inline">Buy</PurchaseButton> |
| **Bottom Plate** | 1 | CNC machined 2mm carbon fiber | <PurchaseButton href="https://yirrasystems.com/product/prod_SUaVaLa36ydpSg" variant="inline">Buy</PurchaseButton> |
| **Spine** | 1 | CNC machined 4mm carbon fiber | <PurchaseButton href="https://yirrasystems.com/product/prod_SUaZIcnKA0qSXg" variant="inline">Buy</PurchaseButton> |

---

## Carbon Tubes

| Component | Qty | Specification |
|-----------|-----|---------------|
| **Carbon Tubes** | 2 | 11mm OD tube for front arms (cut length 133mm) |
| **Carbon Tubes** | 2 | 11mm OD tube for rear arms (cut length 157mm) |

---

## Fastener BOM

Complete hardware kit for Replicant GEN 1 assembly. All fasteners are metric with standard pitches.

<PurchaseButton href="https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV" variant="primary">
  Buy Complete Fastener Kit
</PurchaseButton>

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
|      19 |   4 | M3 Heatset Insert               | —      | Brass    | —      | —              | Mounting the arms and flight stack    |

---

#### Thread-forming screws for plastic — Delta PT® (M3)

| Item No | Qty | Type / Spec                            | Length | Material           | Finish | Strength class | Purpose                                                 |
| ------: | --: | -------------------------------------- | ------ | ------------------ | ------ | -------------- | ------------------------------------------------------- |
|       5 |   2 | Delta PT® **M3×10**, countersunk, Torx | 10mm   | Heat-treated steel | Black  | PT10           | Fastens the XT60 to the battery rail                    |
|       9 |   2 | Delta PT® **M3×30**, low head, Torx    | 30mm   | Heat-treated steel | Black  | PT10           | Angled fasteners mounting the battery rail to the drone |
|      10 |   4 | Delta PT® **M3×25**, countersunk, Torx | 25mm   | Heat-treated steel | Black  | PT10           | Angled arm boss reinforcement screws                    |

---

#### Low head Torx machine screws — ISO 14580 (M3)

| Item No | Qty | Type / Spec                                        | Length | Material    | Finish | Strength class | Purpose                                |
| ------: | --: | -------------------------------------------------- | ------ | ----------- | ------ | -------------- | -------------------------------------- |
|       7 |   1 | ISO 14580 **M3×25**, low head Torx (machine screw) | 25mm   | Alloy steel | Black  | 12.9           | Fastens the spine toward the rear      |
|       8 |   4 | ISO 14580 **M3×25**, low head Torx (machine screw) | 25mm   | Alloy steel | Black  | 12.9           | Front + rear bottom arm mounting screw |
|      17 |   1 | ISO 14580 **M3×8**, low head Torx (machine screw)  | 8mm    | Alloy steel | Black  | 12.9           | Secures the front of the top cover      |

---

#### Button head socket machine screws — ISO 7380 (M3)

| Item No |   Qty | Type / Spec                            | Length | Material                                        | Finish       | Strength class | Purpose                                                             |
| ------: | ----: | -------------------------------------- | ------ | ----------------------------------------------- | ------------ | -------------- | ------------------------------------------------------------------- |
|      11 |    16 | ISO 7380 **M3×10**, button head socket | 10mm   | Alloy steel                                     | Black        | 12.9           | Motor mounting screws                                               |
|      12 |     2 | ISO 7380 **M3×10**, button head socket | 10mm   | Alloy steel                                     | Black        | 12.9           | Rear battery rail mounting screws                                   |
|      13 |     4 | ISO 7380 **M3×12**, button head socket | 12mm   | Alloy steel                                     | Black        | 12.9           | Top + bottom nose cone mounting screws                              |
|      14 |     2 | ISO 7380 **M3×16**, button head socket | 16mm   | Alloy steel *(or steel with gold TiN/PVD coat)* | Black / Gold | 12.9           | Titanium coated forward spine mounting screws                       |
|      15 |     1 | ISO 7380 **M3×16**, button head socket | 16mm   | Alloy steel                                     | Black        | 12.9           | Rear spine standoff retaining screw                                 |
|      16 |     4 | ISO 7380 **M3×18**, button head socket | 18mm   | Alloy steel                                     | Black        | 12.9           | Arm mounting screws for 20×20 stack (shorter so it won't interfere) |
|      18 | (opt) | ISO 7380 **M3×35**, button head socket | 35mm   | Alloy steel                                     | Black        | 12.9           | Optional longer 30×30 stack screw + motor mount                     |

---

#### Socket cap screws — M2 electronics / camera

| Item No | Qty | Type / Spec                                 | Length | Material    | Finish | Strength class | Purpose                                   |
| ------: | --: | ------------------------------------------- | ------ | ----------- | ------ | -------------- | ----------------------------------------- |
|       3 |   2 | **M2×5** socket cap head *(from ISHCS0205)* | 5mm    | Alloy steel | Black  | 12.9           | Mounts the Power Distribution Board       |
|       4 |   4 | **M2×7** socket cap head *(from ISHCS0207)* | 7mm    | Alloy steel | Black  | 12.9           | Mounts the O4 Pro Air Unit                |
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

| Component | Qty | Specification |
|-----------|-----|---------------|
| **6S LiPo Battery** | 1 | 5000mAh, Molicel P50B cells |

---

## Purchaseable Parts

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', margin: '24px 0' }}>
  <ProductCard product={{
    id: 'prod_TlNyUSO8eHGzCV',
    name: 'Complete Fastener Kit',
    category: 'Hardware',
    description: 'Complete hardware kit for Replicant GEN 1 assembly. All fasteners are metric with standard pitches.',
    purchaseUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV'
  }} />
  <ProductCard product={{
    id: 'prod_T4TaxIrK5JjUMI',
    name: 'Power Management Board',
    category: 'Electronics',
    description: 'Custom PCB that handles power distribution, voltage regulation, and battery monitoring.',
    purchaseUrl: 'https://yirrasystems.com/product/prod_T4TaxIrK5JjUMI'
  }} />
  <ProductCard product={{
    id: 'prod_SUaZIcnKA0qSXg',
    name: 'Carbon Fiber Spine',
    category: 'Structure',
    description: 'CNC machined 4mm carbon fiber spine for the drone frame.',
    purchaseUrl: 'https://yirrasystems.com/product/prod_SUaZIcnKA0qSXg'
  }} />
  <ProductCard product={{
    id: 'prod_SUaVaLa36ydpSg',
    name: 'Carbon Fiber Bottom Plate',
    category: 'Structure',
    description: 'CNC machined 2mm carbon fiber bottom plate.',
    purchaseUrl: 'https://yirrasystems.com/product/prod_SUaVaLa36ydpSg'
  }} />
  <ProductCard product={{
    id: 'prod_SUaQiz6E625P9V',
    name: 'Carbon Fiber Top Plate',
    category: 'Structure',
    description: 'CNC machined 3mm carbon fiber top plate.',
    purchaseUrl: 'https://yirrasystems.com/product/prod_SUaQiz6E625P9V'
  }} />
  <ProductCard product={{
    id: 'prod_SR6kjyZnXCaSC0',
    name: '6S LiPo Battery',
    category: 'Power',
    description: '5000mAh 6S LiPo battery with Molicel P50B cells.',
    purchaseUrl: 'https://yirrasystems.com/product/prod_SR6kjyZnXCaSC0'
  }} />
</div>

## Next Steps

1. [CAD Downloads](/docs/downloads) - Get print files
2. [3D Printing](/docs/nylon-printing) - Print preparation
3. [Arm Bonding](/docs/arm-bonding) - Start assembly
