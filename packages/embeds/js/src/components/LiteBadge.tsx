import { onCleanup, onMount } from 'solid-js'
import { TypebotLogo } from './icons/TypebotLogo'

type Props = {
  botContainer: HTMLDivElement | undefined
}

export const LiteBadge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined
  let observer: MutationObserver | undefined

  const appendBadgeIfNecessary = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if (
          'id' in removedNode &&
          liteBadge &&
          removedNode.id == 'lite-badge'
        ) {
          console.log("Sorry, you can't remove the brand 😅")
          props.botContainer?.append(liteBadge)
        }
      })
    })
  }

  onMount(() => {
    if (!document || !props.botContainer) return
    observer = new MutationObserver(appendBadgeIfNecessary)
    observer.observe(props.botContainer, {
      subtree: false,
      childList: true,
    })
  })

  onCleanup(() => {
    if (observer) observer.disconnect()
  })

  return (
    <div style={{ width:  "100%" , height:  "30px" , background : "#929292" , display : "flex" , "justify-content" : "center" , "align-items" : "center", position : "absolute" , bottom : 0 , left:  0 }} >
    <a
      ref={liteBadge}
      href={'https://arthink.ai/'}
      target="_blank"
      rel="noopener noreferrer"
      style={{ "text-decoration" : "none"  }}
      // class="lite-badge"
      // id="lite-badge"
    >
      {/* <TypebotLogo /> */}
      <span style={{ "font-size" : "11px" , color : "white" }} > ⚡ Powered by Quadz</span>
    </a>
   </div>
  )
}
