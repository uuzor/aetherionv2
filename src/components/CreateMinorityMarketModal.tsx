import { useMemo, useState } from 'react';
import { X, Upload } from 'lucide-react';
import type { Address } from 'viem';

type OptionDraft = {
  label: string;
  file: File | null;
  previewUrl: string;
};

type Props = {
  open: boolean;
  isSubmitting?: boolean;
  tokenPairs: Array<{
    tokenAddress: Address;
    confidentialTokenAddress: Address;
    isValid: boolean;
  }>;
  tokenOptions: Array<{
    address: Address;
    label: string;
  }>;
  tokenRegistryLoading?: boolean;
  onClose: () => void;
  onCreate: (payload: {
    question: string;
    questionImage: File | null;
    options: Array<{ label: string; image: File }>;
    stakeToken: Address;
    stakeAmount: string;
    durationHours: string;
  }) => Promise<void>;
};

const initialOptions = (): OptionDraft[] => [
  { label: '', file: null, previewUrl: '' },
  { label: '', file: null, previewUrl: '' },
  { label: '', file: null, previewUrl: '' },
];

export function CreateMinorityMarketModal({
  open,
  isSubmitting = false,
  tokenPairs,
  tokenOptions,
  tokenRegistryLoading = false,
  onClose,
  onCreate,
}: Props) {
  const [question, setQuestion] = useState('');
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [questionPreview, setQuestionPreview] = useState('');
  const [options, setOptions] = useState<OptionDraft[]>(initialOptions);
  const [stakeToken, setStakeToken] = useState<Address | ''>('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [error, setError] = useState('');


  const selectedPair = useMemo(
    () => tokenPairs.find((pair) => pair.tokenAddress === stakeToken),
    [stakeToken, tokenPairs]
  );

  if (!open) {
    return null;
  }

  function resetState() {
    setQuestion('');
    setQuestionImage(null);
    setQuestionPreview('');
    setOptions(initialOptions());
    setStakeToken('');
    setStakeAmount('');
    setDurationHours('24');
    setError('');
  }

  function handleClose() {
    if (isSubmitting) return;
    resetState();
    onClose();
  }

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setOptions((current) => current.map((option, optionIndex) => (optionIndex === index ? { ...option, ...patch } : option)));
  }

  async function handleSubmit() {
    setError('');

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError('Question is required.');
      return;
    }

    if (!stakeToken) {
      setError('Select a stake token from the registry.');
      return;
    }

    if (!stakeAmount.trim() || Number(stakeAmount) <= 0) {
      setError('Enter a valid stake amount.');
      return;
    }

    if (!durationHours.trim() || Number(durationHours) <= 0) {
      setError('Enter a valid duration in hours.');
      return;
    }

    const normalizedOptions = options.map((option) => ({ label: option.label.trim(), image: option.file }));
    if (normalizedOptions.some((option) => !option.label)) {
      setError('Each option needs a label.');
      return;
    }

    if (normalizedOptions.some((option) => !option.image)) {
      setError('Each option needs an image upload.');
      return;
    }

    try {
      await onCreate({
        question: trimmedQuestion,
        questionImage,
        options: normalizedOptions as Array<{ label: string; image: File }>,
        stakeToken,
        stakeAmount: stakeAmount.trim(),
        durationHours: durationHours.trim(),
      });
      resetState();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create market.');
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto border border-chalk/10 bg-carbon p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-medium uppercase tracking-[0.032em] text-citrine" style={{ fontSize: '10px' }}>
              CREATE MARKET
            </p>
            <h2 className="mt-2 font-medium text-bone" style={{ fontSize: '28px', lineHeight: 1.1 }}>
              Build a social MinorityWin market
            </h2>
            <p className="mt-2 max-w-2xl text-stone" style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Create the contract market first, then attach question art and option pictures so people react to faces, memes, and moments.
            </p>
          </div>
          <button onClick={handleClose} className="text-stone transition-colors hover:text-bone" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
              QUESTION
            </label>
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Who is the best footballer right now?"
              className="mt-3 w-full border border-chalk/10 bg-graphite/20 px-4 py-3 text-bone outline-none transition-colors focus:border-citrine/30"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                STAKE TOKEN
              </label>
              <select
                value={stakeToken}
                onChange={(event) => setStakeToken(event.target.value as Address)}
                className="mt-3 w-full border border-chalk/10 bg-graphite/20 px-4 py-3 text-bone outline-none transition-colors focus:border-citrine/30"
                style={{ fontSize: '14px' }}
                disabled={tokenRegistryLoading || isSubmitting}
              >
                <option value="" disabled>
                  {tokenRegistryLoading ? 'Loading registry tokens...' : 'Choose token'}
                </option>
                {tokenOptions.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                STAKE AMOUNT
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={stakeAmount}
                onChange={(event) => setStakeAmount(event.target.value)}
                placeholder="10"
                className="mt-3 w-full border border-chalk/10 bg-graphite/20 px-4 py-3 text-bone outline-none transition-colors focus:border-citrine/30"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                DURATION (HOURS)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={durationHours}
                onChange={(event) => setDurationHours(event.target.value)}
                placeholder="24"
                className="mt-3 w-full border border-chalk/10 bg-graphite/20 px-4 py-3 text-bone outline-none transition-colors focus:border-citrine/30"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          {selectedPair ? (
            <div className="border border-chalk/10 bg-graphite/20 px-4 py-3 text-stone" style={{ fontSize: '12px', lineHeight: 1.6 }}>
              <span className="text-bone">Confidential wrapper:</span> {selectedPair.confidentialTokenAddress}
            </div>
          ) : null}

          <div>
            <label className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
              QUESTION IMAGE (OPTIONAL)
            </label>
            <div className="mt-3 grid gap-4 md:grid-cols-[220px_1fr]">
              <ImagePreview previewUrl={questionPreview} label="Question cover" />
              <label className="flex cursor-pointer items-center gap-3 border border-dashed border-chalk/20 bg-graphite/20 px-4 py-4 text-stone transition-colors hover:border-citrine/30 hover:text-bone">
                <Upload size={16} className="text-citrine" />
                <span style={{ fontSize: '14px' }}>{questionImage ? questionImage.name : 'Upload question cover image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setQuestionImage(file);
                    setQuestionPreview(file ? URL.createObjectURL(file) : '');
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="font-medium uppercase tracking-[0.032em] text-stone" style={{ fontSize: '10px' }}>
                OPTIONS
              </label>
              <span className="text-stone" style={{ fontSize: '12px' }}>Three options only</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {options.map((option, index) => (
                <div key={index} className="border border-chalk/10 bg-graphite/20 p-4">
                  <ImagePreview previewUrl={option.previewUrl} label={`Option ${index + 1}`} />
                  <input
                    type="text"
                    value={option.label}
                    onChange={(event) => updateOption(index, { label: event.target.value })}
                    placeholder={index === 0 ? 'Lionel Messi' : index === 1 ? 'Cristiano Ronaldo' : 'Victor Osimhen'}
                    className="mt-4 w-full border border-chalk/10 bg-carbon px-3 py-3 text-bone outline-none transition-colors focus:border-citrine/30"
                    style={{ fontSize: '14px' }}
                  />
                  <label className="mt-3 flex cursor-pointer items-center gap-3 border border-dashed border-chalk/20 bg-carbon px-3 py-3 text-stone transition-colors hover:border-citrine/30 hover:text-bone">
                    <Upload size={15} className="text-citrine" />
                    <span style={{ fontSize: '13px' }}>{option.file ? option.file.name : 'Upload option image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        updateOption(index, {
                          file,
                          previewUrl: file ? URL.createObjectURL(file) : '',
                        });
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error ? (
            <div className="border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-stone" style={{ fontSize: '13px' }}>
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-chalk/10 pt-6">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="border border-chalk/10 px-5 py-3 font-medium text-bone/80 transition-colors hover:text-bone disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontSize: '14px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-btn bg-citrine px-6 py-3 font-medium text-carbon transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontSize: '14px' }}
            >
              <span className="inline-block h-2 w-2 bg-carbon" />
              {isSubmitting ? 'Creating...' : 'Create market'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImagePreview({ previewUrl, label }: { previewUrl: string; label: string }) {
  return (
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border border-chalk/10 bg-carbon text-center text-stone">
      {previewUrl ? (
        <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span style={{ fontSize: '12px' }}>{label}</span>
      )}
    </div>
  );
}
