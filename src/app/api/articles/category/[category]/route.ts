import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const category = decodeURIComponent(params.category)
    const articles = await prisma.article.findMany({
      where: {
        category: category,
        isPublished: true,
      },
      orderBy: {
        pubDate: 'desc',
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    })

    if (!articles) {
      return new NextResponse('No articles found', { status: 404 })
    }

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles by category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
