# MoneyShield QR evaluation

The supplied QR datasets were processed locally to measure how often MoneyShield could decode images. They contain no verified fake or genuine QR labels. The scanner assesses decoded content using payment-field checks and the existing MoneyShield link rules.

| Attachment | Inventory | Result |
| --- | --- | --- |
| `archive (2)` | 502 training photos with 1,161 QR locations and 60 test photos with 97 QR locations. All annotations mark the single QR_CODE class. | On the 60 test photos, a full-frame decode alone read a code in 24 images. Padding, contrast and overlapping-crop attempts increased that to 34 images. |
| `qr_dataset` | 10,000 PNGs across 2,500 filename families, four variants per family. | Read a code in all 10,000 images. Their decoded values fell outside the supported UPI and web-link checks. |

Counts measure images with at least one readable QR. They do not establish complete detection of every QR in a photo or fraud classification accuracy. The 60-photo set includes glare, blur, close crops and other difficult conditions. The scanner's result remains inconclusive when it cannot decode an image. Both the images and their decoded values stayed local.

## Reproduce

From the project directory, use Node.js 20 or later and Python 3 with Pillow available. Put the original folders together under one directory and run:

```sh
python3 benchmarks/evaluate-qr.py --dataset-root "$HOME/Desktop" --png-groups 2500
```

The smaller default uses 250 deterministic PNG families. The script streams image pixels to the bundled JavaScript decoder and reports only counts and result types.

## Payment and link checks

Typed expectations are used for comparison inside the browser. Supported checks include the UPI recipient and fixed amount, country currency field, duplicated payment parameters, and the real host of a decoded website address. A code for a different account can have a completely ordinary visual appearance. Browser tests use only fictional examples in `public/demos/`.

The reader is [jsQR 1.4.0](https://github.com/cozmo/jsQR/tree/v1.4.0) with a local ES module wrapper and the included Apache 2.0 license. Payment-field definitions and safety guidance draw on [Google Pay's UPI integration guide](https://developers.google.com/pay/india/api/android/in-app-payments) and [NPCI's fraud awareness guidance](https://www.npci.org.in/fraud-awareness). The location-annotated archive is [QR Code v2](https://universe.roboflow.com/lihang-xu/qr-code-oerhe/dataset/2), CC BY 4.0. Only synthetic demo QR images are shipped.
