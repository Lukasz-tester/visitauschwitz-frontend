import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  return (
    <div className="md:px-[17.3%] mt-16">
      <div className="container">
        {children ||
          (richText && (
            <RichText
              content={richText}
              enableGutter={false}
              className="font-heading prose-h1:text-4xl sm:prose-h1:text-5xl prose-headings:font-normal prose-p:font-sans  prose-p:pt-3 opacity-85"
            />
          ))}
      </div>
    </div>
  )
}

// import React from 'react'

// import type { Page } from '@/payload-types'
// import { serializeLexical, type NodeTypes } from '@/components/RichText/serialize'

// type LowImpactHeroType =
//   | {
//       children?: React.ReactNode
//       richText?: never
//     }
//   | (Omit<Page['hero'], 'richText'> & {
//       children?: never
//       richText?: Page['hero']['richText']
//     })

// export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
//   const nodes = (richText?.root?.children ?? []) as NodeTypes[]
//   const headingNode = nodes.find((n) => n.type === 'heading') as
//     | (NodeTypes & { type: 'heading' })
//     | undefined
//   const subtitleNodes = nodes.filter((n) => n.type === 'paragraph') as (NodeTypes & {
//     type: 'paragraph'
//   })[]

//   return (
//     <div className="md:px-[17.3%] mt-16">
//       <div className="container">
//         {children ||
//           (richText && (
//             <h1 className="font-heading text-4xl sm:text-5xl opacity-85">
//               {headingNode && serializeLexical({ nodes: headingNode.children as NodeTypes[] })}
//               {subtitleNodes.length > 0 && <span className="sr-only">{' - '}</span>}
//               {subtitleNodes.map((pNode, i) => (
//                 <span
//                   key={i}
//                   className="block font-sans text-base md:text-2xl font-normal pt-3 opacity-90"
//                 >
//                   {serializeLexical({ nodes: pNode.children as NodeTypes[] })}
//                 </span>
//               ))}
//             </h1>
//           ))}
//       </div>
//     </div>
//   )
// }
