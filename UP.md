

### Privacy Section Changes

#### 1. `privacy.intro.content`
**New:** "This website is an independent educational project operated by the Administrator and is not affiliated with, endorsed by, or officially connected to the Auschwitz-Birkenau State Museum or any other institution. Voluntary donations received through this website are treated as voluntary personal support for this project and are managed separately from commercial services offered by the Administrator."

#### 2. `privacy.dataCollection.intro`
**New:** "I collect the following personal data voluntarily provided through the contact form, newsletter signup, and voluntary support process:"


#### 3. `privacy.dataCollection.item6` (NEW ITEM TO ADD)
"Basic transaction data (amount, date and payment reference) when you provide voluntary support through third-party payment providers."

**Note:** Keep existing items 1-5 unchanged, only add item6.

#### 4. `privacy.legalBasis.content`
**New:** "...(c) where applicable in the future, performance of a contract (Article 6(1)(b)) if paid products or services are offered; and (d) compliance with legal obligations (Article 6(1)(c)) where required by applicable accounting, tax, fraud-prevention, or record-keeping obligations."

#### 5. `privacy.dataStorage.content`

**New:** "Personal data submitted through this website is stored in MongoDB Atlas, a cloud-hosted database service provided by MongoDB, Inc. Data is stored on servers located within the European Union (EU region). Transaction data related to voluntary support is processed through external payment providers and banking services selected by the Administrator. Such data is retained only where necessary for record-keeping, fraud prevention, or legal compliance. MongoDB Atlas employs encryption at rest and in transit, access controls, and regular security audits."

### Terms Section Changes

#### 1. `terms.intro.content`

**New:** "These Terms of Use govern your access to and use of this website operated by ŁUKASZ TARNOWSKI, conducting business under the name ŁUKASZ TARNOWSKI, registered in the Central Register and Information on Economic Activity (CEIDG), NIP: 5492257321, REGON: 12022820400000, with its registered office at UL. DR JANUSZA KORCZAKA 17, PL-32-600 RAJSKO, Poland (\"Service Provider\"). Voluntary donations received through this website are treated as voluntary personal support for an independent educational project and are managed separately from commercial services offered by the Service Provider. By accessing or using this website, you agree to comply with these Terms."


#### 2. `terms.noAffiliation` (NEW SECTION)
**New section to add after `terms.eligibility` and before `terms.natureOfWebsite`:**
```json
"noAffiliation": {
  "title": "No Affiliation",
  "content": "This website is an independent informational and educational project and is not affiliated with, endorsed by, or officially connected to the Auschwitz-Birkenau State Museum or any governmental institution."
},
```

#### 3. `terms.supportDisclaimer` (NEW SECTION)
**New section to add after `terms.noAffiliation` and before `terms.natureOfWebsite`:**
```json
"supportDisclaimer": {
  "title": "Voluntary Support",
  "content": "All voluntary donations (darowizny) are purely optional gifts with no expectation of any goods, services, benefits or exclusive content in return. Voluntary support provided through this website does not create any customer relationship, subscription, membership, ownership interest, or entitlement to future products, services, updates, or benefits. Supporting the project does not create an ongoing obligation to provide future updates, services, or continued website availability. Voluntary support is generally non-refundable unless required by applicable law or in cases of technical payment error."
},
```

### Step 1: Update Privacy Section

1. **Locate** `privacy.intro.content` and replace the content with the translated version of the new English text
2. **Locate** `privacy.dataCollection.intro` and add "and voluntary support process" (or equivalent in target language) to the intro text
3. **Locate** `privacy.dataCollection` and add a new `item6` key with the translated version of the transaction data text
4. **Locate** `privacy.legalBasis.content` and add the (d) clause about legal obligations at the end
5. **Locate** `privacy.dataStorage.content` and replace with the translated version of the new content about transaction data

### Step 2: Update Terms Section

1. **Locate** `terms.intro.content` and add the sentence about voluntary donations after the company information
2. **Add** a new `noAffiliation` section after `terms.eligibility` and before `terms.natureOfWebsite`
3. **Add** a new `supportDisclaimer` section after `noAffiliation` and before `terms.natureOfWebsite`

### Step 3: Verify JSON Structure

Ensure that:
- All commas are properly placed
- All strings are properly escaped (especially quotes within strings)
- No duplicate keys exist
- The file is valid JSON

## Translation Guidelines

### Key Terms to Translate Consistently

- "voluntary donations" / "voluntary support" - use appropriate terminology for each locale
- "voluntary personal support" - maintain this specific phrasing
- "managed separately from commercial services" - maintain this distinction
- "transaction data" - use appropriate financial/legal terminology
- "payment providers" - use appropriate terminology
- "record-keeping, fraud prevention, or legal compliance" - use appropriate legal terminology

### Quotation Marks

**IMPORTANT:** Always use proper locale-specific quotation marks instead of straight quotes (") in translated texts:

- **German (de.json)**: Use „ and “ (e.g., „Verantwortlicher“)
- **Polish (pl.json)**: Use „ and “ (e.g., „Administrator“)
- **Spanish (es.json)**: Use « and » (e.g., «Prestador del servicio»)
- **Italian (it.json)**: Use « and » (e.g., «Prestatore del servizio»)
- **Dutch (nl.json)**: Use „ and “ (e.g., „Verantwoordelijke“)
- **English (en.json)**: Use straight quotes " (e.g., "Service Provider")

### Locale-Specific Notes

#### Polish (pl.json)
- Keep "(darowizny)" in the `supportDisclaimer` content as it's the Polish legal term
- Ensure proper Polish legal terminology for GDPR references

#### German (de.json)
- Use appropriate German legal terminology for GDPR references
- Ensure proper German financial terminology

#### Italian (it.json)
- Use appropriate Italian legal terminology for GDPR references
- Ensure proper Italian financial terminology

#### Dutch (nl.json)
- Use appropriate Dutch legal terminology for GDPR references
- Ensure proper Dutch financial terminology

#### Spanish (es.json)
- Use appropriate Spanish legal terminology for GDPR references
- Ensure proper Spanish financial terminology

## Verification Checklist

After updating each locale file, verify:

- [ ] `privacy.intro.content` updated with new educational project language
- [ ] `privacy.dataCollection.intro` includes "voluntary support process"
- [ ] `privacy.dataCollection.item6` added with transaction data text
- [ ] `privacy.legalBasis.content` includes (d) legal obligations clause
- [ ] `privacy.dataStorage.content` updated with transaction data language
- [ ] `terms.intro.content` includes voluntary donations sentence
- [ ] `terms.noAffiliation` section added
- [ ] `terms.supportDisclaimer` section added
- [ ] JSON syntax is valid (no lint errors)
- [ ] All translations are accurate and appropriate for the locale
- [ ] Legal terminology is correct for the target jurisdiction


## Contact

For questions about these updates or translation issues, contact the project maintainer.
