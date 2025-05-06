"use client"

export const ExamConfigSection = ({
  requiresExam,
  selectedExamConfigId,
  setSelectedExamConfigId,
  isCreatingNewExamConfig,
  setIsCreatingNewExamConfig,
  examConfigs,
  examConfigsLoading,
  examConfigsError,
  passingThreshold,
  setPassingThreshold,
  newExamConfig,
  setNewExamConfig,
}) => {
  if (!requiresExam) return null

  const hasExistingConfigs = Array.isArray(examConfigs) && examConfigs.length > 0

  return (
    <>
      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text">Exam Configuration</span>
        </label>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <select
              className="select select-bordered flex-grow"
              value={isCreatingNewExamConfig ? "new" : selectedExamConfigId}
              onChange={(e) => {
                const value = e.target.value
                if (value === "new") {
                  setIsCreatingNewExamConfig(true)
                  setSelectedExamConfigId("")
                } else {
                  setIsCreatingNewExamConfig(false)
                  setSelectedExamConfigId(value)
                }
              }}
              disabled={examConfigsLoading}
            >
              <option value="">Select Exam Config</option>
              {hasExistingConfigs ? (
                examConfigs.map((config) => (
                  <option key={config._id} value={config._id}>
                    {config.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No existing configs
                </option>
              )}
              <option value="new">Create New Exam Config</option>
            </select>
            {examConfigsLoading && <span className="loading loading-spinner"></span>}
          </div>
          {examConfigsError && <div className="text-error text-sm">{examConfigsError}</div>}
          {!hasExistingConfigs && !examConfigsError && !examConfigsLoading && (
            <div className="text-info text-sm">No existing exam configurations found. You can create a new one.</div>
          )}
        </div>
      </div>

      {isCreatingNewExamConfig ? (
        <NewExamConfigForm newExamConfig={newExamConfig} setNewExamConfig={setNewExamConfig} />
      ) : (
        selectedExamConfigId && (
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Passing Threshold</span>
            </label>
            <input
              type="number"
              placeholder="Enter passing threshold"
              className="input input-bordered w-full"
              value={passingThreshold}
              onChange={(e) => setPassingThreshold(e.target.value)}
              min="0"
              max="100"
              required
            />
          </div>
        )
      )}
    </>
  )
}

const NewExamConfigForm = ({ newExamConfig, setNewExamConfig }) => {
  return (
    <div className="space-y-4 mb-4 p-4 border border-base-300 rounded-lg">
      <h4 className="font-medium">New Exam Configuration</h4>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          type="text"
          placeholder="Enter exam config name"
          className="input input-bordered w-full"
          value={newExamConfig.name}
          onChange={(e) => setNewExamConfig((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          placeholder="Enter description"
          className="textarea textarea-bordered w-full"
          value={newExamConfig.description}
          onChange={(e) => setNewExamConfig((prev) => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Google Sheet ID</span>
        </label>
        <input
          type="text"
          placeholder="Enter Google Sheet ID"
          className="input input-bordered w-full"
          value={newExamConfig.googleSheetId}
          onChange={(e) => setNewExamConfig((prev) => ({ ...prev, googleSheetId: e.target.value }))}
          required
        />
        <label className="label">
          <span className="label-text-alt">The ID from your Google Sheet URL</span>
        </label>
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Form URL</span>
        </label>
        <input
          type="url"
          placeholder="Enter Google Form URL"
          className="input input-bordered w-full"
          value={newExamConfig.formUrl}
          onChange={(e) => setNewExamConfig((prev) => ({ ...prev, formUrl: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Student Identifier Column</span>
          </label>
          <input
            type="text"
            placeholder="Column name"
            className="input input-bordered w-full"
            value={newExamConfig.studentIdentifierColumn}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, studentIdentifierColumn: e.target.value }))}
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Score Column</span>
          </label>
          <input
            type="text"
            placeholder="Column name"
            className="input input-bordered w-full"
            value={newExamConfig.scoreColumn}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, scoreColumn: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Default Passing Threshold (%)</span>
        </label>
        <input
          type="number"
          placeholder="Enter threshold"
          className="input input-bordered w-full"
          value={newExamConfig.defaultPassingThreshold}
          onChange={(e) => setNewExamConfig((prev) => ({ ...prev, defaultPassingThreshold: Number(e.target.value) }))}
          min="0"
          max="100"
          required
        />
      </div>
    </div>
  )
}
