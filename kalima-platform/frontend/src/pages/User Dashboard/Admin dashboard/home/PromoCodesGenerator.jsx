"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Ticket, Copy, Check, AlertCircle, Download, Printer } from 'lucide-react'
import { generatePromoCodes } from "../../../../routes/codes"
import { getAllLecturers } from "../../../../routes/fetch-users"
import QRCode from "qrcode"

const PromoCodeGenerator = () => {
  const { t, i18n } = useTranslation("admin")
  const isRTL = i18n.language === "ar"
  const dir = isRTL ? "rtl" : "ltr"

  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [generatedCodes, setGeneratedCodes] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [generateQrCodes, setGenerateQrCodes] = useState(false)
  const [qrCodeSize, setQrCodeSize] = useState(128)
  const [qrCodeUrls, setQrCodeUrls] = useState([])
  const printFrameRef = useRef(null)

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        setLoading(true)
        const response = await getAllLecturers()

        if (response.success) {
          setLecturers(Array.isArray(response.data) ? response.data : [])
        } else {
          setError(t("admin.errors.fetchLecturers"))
        }
      } catch (err) {
        console.error("Error fetching lecturers:", err)
        setError(t("admin.errors.fetchLecturers"))
      } finally {
        setLoading(false)
      }
    }

    fetchLecturers()
  }, [t])

  // Generate QR codes when codes are generated and QR option is enabled
  useEffect(() => {
    if (generateQrCodes && generatedCodes.length > 0) {
      generateQrCodeUrls()
    }
  }, [generateQrCodes, generatedCodes, qrCodeSize])

  const generateQrCodeUrls = async () => {
    try {
      const urls = await Promise.all(
        generatedCodes.map(async (code) => {
          const codeData = getQrCodeValue(code)
          const options = {
            errorCorrectionLevel: "H",
            margin: 1,
            width: qrCodeSize,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          }

          try {
            const url = await QRCode.toDataURL(codeData, options)
            return url
          } catch (err) {
            console.error("Error generating QR code:", err)
            return null
          }
        }),
      )

      setQrCodeUrls(urls.filter((url) => url !== null))
    } catch (err) {
      console.error("Error generating QR codes:", err)
      setError(t("admin.errors.qrCodeGenerationFailed"))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "type") {
      // Reset lecturerId when changing to general or promo type
      const newFormData = { ...formData, [name]: value }
      if (value !== "specific") {
        newFormData.lecturerId = ""
      }
      setFormData(newFormData)
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleQrSizeChange = (e) => {
    setQrCodeSize(Number.parseInt(e.target.value) || 128)
  }

  const [formData, setFormData] = useState({
    pointsAmount: 1000,
    numOfCodes: 3,
    lecturerId: "",
    type: "general",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setGeneratedCodes([])
    setQrCodeUrls([])

    if (formData.type !== "promo" && formData.pointsAmount <= 0) {
      setError(t("admin.errors.pointsError"))
      return
    }

    if (formData.numOfCodes <= 0) {
      setError(t("admin.errors.codesError"))
      return
    }

    if (formData.type === "specific" && !formData.lecturerId) {
      setError(t("admin.errors.lecturerRequired"))
      return
    }

    try {
      setLoading(true)
      const payload = {
        numOfCodes: formData.numOfCodes,
        type: formData.type,
      }

      // Only include pointsAmount if not promo type
      if (formData.type !== "promo") {
        payload.pointsAmount = formData.pointsAmount
      }

      // Only include lecturerId if specific type
      if (formData.type === "specific") {
        payload.lecturerId = formData.lecturerId
      }

      const response = await generatePromoCodes(payload)

      if (response.status === "success") {
        setSuccess(t("admin.success.codesGenerated"))
        setGeneratedCodes(response.data.codes || [])
      } else {
        setError(response.message || t("admin.errors.generationFailed"))
      }
    } catch (err) {
      console.error("Error generating promo codes:", err)
      setError(t("admin.errors.generationFailed"))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (code, index) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }

  const downloadQRCode = (dataUrl, code) => {
    const downloadLink = document.createElement("a")
    downloadLink.href = dataUrl
    downloadLink.download = `qrcode-${code}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const downloadAllQRCodes = () => {
    qrCodeUrls.forEach((url, index) => {
      if (url && generatedCodes[index]) {
        setTimeout(() => {
          downloadQRCode(url, generatedCodes[index].code)
        }, index * 500) // Add delay to prevent browser issues with multiple downloads
      }
    })
  }

  // Create a value for the QR code that includes relevant information
  const getQrCodeValue = (code) => {
    const codeData = {
      code: code.code,
      type: formData.type,
      pointsAmount: formData.type !== "promo" ? code.pointsAmount || formData.pointsAmount : null,
    }
    return JSON.stringify(codeData)
  }

  // Print QR codes
  const printQRCodes = () => {
    if (!printFrameRef.current) return

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups to print QR codes")
      return
    }

    // Generate HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - ${new Date().toLocaleDateString()}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .print-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            page-break-inside: avoid;
          }
          .qr-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            page-break-inside: avoid;
          }
          .qr-code {
            margin-bottom: 10px;
          }
          .qr-code img {
            max-width: 100%;
            height: auto;
          }
          .qr-details {
            font-size: 12px;
          }
          .qr-code-text {
            font-family: monospace;
            font-weight: bold;
            margin: 8px 0;
            word-break: break-all;
          }
          .qr-points {
            margin-top: 5px;
          }
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              padding: 0;
            }
            .print-container {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${generatedCodes
            .map(
              (code, index) => `
            <div class="qr-item">
              <div class="qr-code">
                <img src="${qrCodeUrls[index] || ""}" alt="QR Code">
              </div>
              <div class="qr-details">
                <div class="qr-code-text">${code.code}</div>
                <div class="qr-points">
                  ${
                    formData.type === "promo"
                      ? t("admin.discount")
                      : `${code.pointsAmount || formData.pointsAmount} ${t("admin.points")}`
                  }
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }, 500);
          };
        </script>
      </body>
      </html>
    `

    // Write to the new window and trigger print
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  return (
    <div className="rounded-lg shadow-md p-6 mb-8" dir={dir}>
      <div className="flex items-center gap-2 mb-6">
        <Ticket className="text-primary w-6 h-6" />
        <h2 className="text-xl font-bold">{t("admin.generatePromoCodes")}</h2>
      </div>

      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-control">
            <div className="flex flex-col items-start gap-2">
              <label className="label">
                <span className="label-text font-medium">{t("admin.form.pointsAmount")}</span>
              </label>
              <input
                type="number"
                name="pointsAmount"
                className="input input-bordered w-full"
                value={formData.pointsAmount}
                onChange={handleNumberChange}
                min="1"
                disabled={formData.type === "promo"}
                required={formData.type !== "promo"}
              />
            </div>
          </div>

          <div className="form-control">
            <div className="flex flex-col items-start gap-2">
              <label className="label">
                <span className="label-text font-medium">{t("admin.form.numCodes")}</span>
              </label>
              <input
                type="number"
                name="numOfCodes"
                className="input input-bordered w-full"
                value={formData.numOfCodes}
                onChange={handleNumberChange}
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t("admin.form.codeType")}</span>
            </label>
            <select
              name="type"
              className="select select-bordered w-full"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="general">{t("admin.form.general")}</option>
              <option value="specific">{t("admin.form.specific")}</option>
              <option value="promo">{t("admin.form.promo")}</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t("admin.form.lecturer")}</span>
            </label>
            <select
              name="lecturerId"
              className="select select-bordered w-full"
              value={formData.lecturerId}
              onChange={handleChange}
              disabled={formData.type !== "specific"}
              required={formData.type === "specific"}
            >
              <option value="">{t("admin.form.lecturerPlaceholder")}</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer._id} value={lecturer._id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-control mb-4">
          <label className="cursor-pointer label justify-start gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={generateQrCodes}
              onChange={() => setGenerateQrCodes(!generateQrCodes)}
            />
            <span className="label-text font-medium">{t("admin.form.generateQrCodes")}</span>
          </label>
          <p className="text-sm text-base-content/70 mt-1">{t("admin.form.qrCodeDescription")}</p>
        </div>

        {generateQrCodes && (
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">{t("admin.form.qrCodeSize")}</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="64"
                max="256"
                step="8"
                value={qrCodeSize}
                onChange={handleQrSizeChange}
                className="range range-primary"
              />
              <span>{qrCodeSize}px</span>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {t("admin.generating")}
            </>
          ) : (
            t("admin.generateCodes")
          )}
        </button>
      </form>

      {generatedCodes.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">{t("admin.generatedCodes")}</h3>
            {generateQrCodes && qrCodeUrls.length > 0 && (
              <div className="flex gap-2">
                <button type="button" className="btn btn-sm btn-outline" onClick={printQRCodes}>
                  <Printer className="w-4 h-4 mr-1" />
                  {t("admin.printQrCodes")}
                </button>
                <button type="button" className="btn btn-sm btn-outline" onClick={downloadAllQRCodes}>
                  <Download className="w-4 h-4 mr-1" />
                  {t("admin.downloadAllQrCodes")}
                </button>
              </div>
            )}
          </div>

          {generateQrCodes && qrCodeUrls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generatedCodes.map((code, index) => (
                <div key={code.code || index} className="bg-base-200 p-4 rounded-lg flex flex-col items-center">
                  {qrCodeUrls[index] && (
                    <img
                      src={qrCodeUrls[index] || "/placeholder.svg"}
                      alt={`QR Code for ${code.code}`}
                      width={qrCodeSize}
                      height={qrCodeSize}
                      className="border border-base-300"
                    />
                  )}
                  <div className="mt-2 text-center">
                    <p className="font-mono text-sm break-all">{code.code}</p>
                    <p className="text-sm mt-1">
                      {formData.type === "promo"
                        ? t("admin.discount")
                        : `${code.pointsAmount || formData.pointsAmount} ${t("admin.points")}`}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => copyToClipboard(code.code, index)}
                      title={t("admin.copy")}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {qrCodeUrls[index] && (
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => downloadQRCode(qrCodeUrls[index], code.code)}
                        title={t("admin.download")}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>{t("admin.promoTable.number")}</th>
                    <th>{t("admin.promoTable.code")}</th>
                    <th>{formData.type === "promo" ? t("admin.promoTable.discount") : t("admin.promoTable.points")}</th>
                    <th>{t("admin.promoTable.type")}</th>
                    <th>{t("admin.promoTable.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedCodes.map((code, index) => (
                    <tr key={code.code || index}>
                      <td>{index + 1}</td>
                      <td>
                        <code className="bg-base-200 px-2 py-1 rounded">{code.code}</code>
                      </td>
                      <td>
                        {formData.type === "promo" ? t("admin.discount") : code.pointsAmount || formData.pointsAmount}
                      </td>
                      <td>
                        {formData.type === "specific"
                          ? t("admin.specific")
                          : formData.type === "promo"
                            ? t("admin.promo")
                            : t("admin.general")}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => copyToClipboard(code.code, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span className="sr-only">{t("admin.copy")}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hidden iframe for printing */}
      <iframe ref={printFrameRef} style={{ display: "none" }} title="Print Frame" />
    </div>
  )
}

export default PromoCodeGenerator
