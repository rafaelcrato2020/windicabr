import dynamic from "next/dynamic"

const HomePageClient = dynamic(() => import("./home-page-client"), {
  ssr: false,
})

export default function Home() {
  return <HomePageClient />
}
