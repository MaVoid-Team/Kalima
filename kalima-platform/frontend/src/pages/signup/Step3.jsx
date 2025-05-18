"use client"

import { useState } from "react"

export default function Step3({ formData, toggleHobby, t, hobbiesList, setHobbiesList = null, errors }) {
  const [customHobby, setCustomHobby] = useState("")
  const [customHobbies, setCustomHobbies] = useState([])

  const handleAddCustomHobby = () => {
    if (!customHobby.trim()) return

    // Create a simple ID for the custom hobby
    const hobbyId = `custom-${Date.now()}`

    // Add to local custom hobbies list
    setCustomHobbies([
      ...customHobbies,
      {
        id: hobbyId,
        name: customHobby.trim(),
      },
    ])

    // Select the hobby
    toggleHobby(hobbyId)

    // Clear the input
    setCustomHobby("")
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("form.selectHobbies")}</h3>

      <div className="grid grid-cols-3 gap-2">
        {/* Pre-defined hobbies with images */}
        {hobbiesList.map((hobby) => (
          <div
            key={hobby.id}
            onClick={() => toggleHobby(hobby.id)}
            className={`border-2 rounded-lg p-2 cursor-pointer transition-all 
              ${errors?.hobbies ? "ring-2 ring-error rounded-box p-1" : ""}
              ${
                formData.hobbies.includes(hobby.id)
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-primary/50"
              }`}
          >
            <img src={hobby.img || "/placeholder.svg"} alt={hobby.name} className="w-full object-contain p-2" />
            <p className="text-center mt-2 text-sm">{t(`hobbies.${hobby.name}`) || hobby.name}</p>
          </div>
        ))}
      </div>

      {/* Custom hobbies (text only) */}
      {customHobbies.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">{t("form.yourCustomHobbies") || "Your Custom Hobbies"}</h4>
          <div className="flex flex-wrap gap-2">
            {customHobbies.map((hobby) => (
              <div
                key={hobby.id}
                onClick={() => toggleHobby(hobby.id)}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all
                  ${
                    formData.hobbies.includes(hobby.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/20 hover:bg-secondary/30"
                  }`}
              >
                {hobby.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add custom hobby input */}
      <div className="mt-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={customHobby}
            onChange={(e) => setCustomHobby(e.target.value)}
            placeholder={t("form.enterHobby") || "Enter a hobby"}
            className="input input-sm input-bordered flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddCustomHobby()
              }
            }}
          />
          <button type="button" onClick={handleAddCustomHobby} className="btn btn-sm btn-primary">
            {t("form.add") || "Add"}
          </button>
        </div>
      </div>

      {errors?.hobbies && (
        <div className="text-error text-sm mt-2">{t(`validation.${errors.hobbies}`) || errors.hobbies}</div>
      )}
    </div>
  )
}
