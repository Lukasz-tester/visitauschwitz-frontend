'use client'
import type { Form as FormType } from './types'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import { buildInitialFormState } from './buildInitialFormState'
import { fields } from './fields'
import { useTranslations } from 'next-intl'

export type Value = unknown

export interface Property {
  [key: string]: Value
}

export interface Data {
  [key: string]: Property | Property[]
}

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  changeBackground?: boolean | null
  enableIntro: boolean
  enableOutro: boolean
  form: FormType
  introContent?: {
    [k: string]: unknown
  }[]
  outroContent?: {
    [k: string]: unknown
  }[]
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    changeBackground,
    enableIntro,
    enableOutro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    outroContent,
  } = props

  const formMethods = useForm({
    defaultValues: buildInitialFormState(formFromProps.fields ?? []),
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const honeypotRef = useRef<HTMLInputElement>(null)
  const lastSubmitRef = useRef(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false)
  const router = useRouter()
  const t = useTranslations()

  const onSubmit = useCallback(
    (data: Data) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        // Honeypot: reject if the hidden field was filled
        if (honeypotRef.current?.value) return

        // Rate limit: 10s cooldown between submissions
        const now = Date.now()
        if (now - lastSubmitRef.current < 10_000) return
        lastSubmitRef.current = now

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch('/api/contact', {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (subscribeToNewsletter) {
            const emailField = Object.entries(data).find(([key]) =>
              key.toLowerCase().includes('email'),
            )
            fetch('/api/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: emailField?.[1] || '',
              }),
            }).catch(() => {})
          }

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType, subscribeToNewsletter],
  )

  return (
    <div
      className={`w-full ${changeBackground ? 'bg-card-foreground md:px-[17.3%] ' : 'container pb-20 max-w-[600]'}`}
    >
      <div className={` ${changeBackground ? ' max-w-2xl container' : ''}`}>
        <FormProvider {...formMethods}>
          {enableIntro && introContent && !hasSubmitted && (
            <RichText className="mb-8" content={introContent} enableGutter={false} />
          )}
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText content={confirmationMessage as Record<string, any>} />
          )}
          {isLoading && !hasSubmitted && <p>{t('loading')}</p>}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <form id={formID} onSubmit={handleSubmit(onSubmit)}>
              {/* Honeypot field — hidden from real users, bots will fill it */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  opacity: 0,
                  height: 0,
                  overflow: 'hidden',
                }}
              >
                <label htmlFor="_hp_name">Do not fill this field</label>
                <input
                  id="_hp_name"
                  type="text"
                  autoComplete="off"
                  tabIndex={-1}
                  ref={honeypotRef}
                />
              </div>
              <div className="mb-5 last:mb-0">
                {formFromProps &&
                  formFromProps.fields &&
                  formFromProps.fields?.map((field, index) => {
                    const Field: React.FC<any> = fields?.[field.blockType]
                    if (Field) {
                      const translationKey = `contact-${field.name}`
                      const translatedLabel = t.has(translationKey)
                        ? t(translationKey)
                        : field.label
                      return (
                        <div
                          className={`mb-4 last:mb-0 ${!changeBackground ? '[&_input]:bg-card [&_textarea]:bg-card [&_[role=combobox]]:bg-card' : ''}`}
                          key={index}
                        >
                          <Field
                            form={formFromProps}
                            {...field}
                            label={translatedLabel}
                            {...formMethods}
                            control={control}
                            errors={errors}
                            register={register}
                          />
                        </div>
                      )
                    }
                    return null
                  })}
              </div>

              <div className="mb-6 flex items-center gap-2">
                <Checkbox
                  id="newsletter-optin"
                  checked={subscribeToNewsletter}
                  onCheckedChange={(checked) => setSubscribeToNewsletter(checked === true)}
                  className="h-4 w-4 shrink-0 rounded border border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <label htmlFor="newsletter-optin" className="text-sm cursor-pointer select-none">
                  {t('consent-commercial')}
                  <Link href="/privacy" className="underline hover:text-primary">
                    {t('privacy-policy')}
                  </Link>
                </label>
              </div>

              <Button
                form={formID}
                type="submit"
                variant="default"
                aria-label="Submit Contact Form"
                disabled={!subscribeToNewsletter}
              >
                {t.has('contact-submit') ? t('contact-submit') : submitButtonLabel}
              </Button>
            </form>
          )}
          {enableOutro && outroContent && !hasSubmitted && (
            <RichText className="mt-8" content={outroContent} enableGutter={false} />
          )}
        </FormProvider>
      </div>
    </div>
  )
}
