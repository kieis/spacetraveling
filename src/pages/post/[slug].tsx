/* eslint-disable prettier/prettier */

import { FiUser, FiCalendar, FiClock } from "react-icons/fi";

import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';

import styles from './post.module.scss';
import { useEffect } from "react";
import dateFormat from "../../utils/dateFormat";
import { useRouter } from "next/router";

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const getTimeReading = (): string => {
    let wordsCount = 0;

    post.data.content.forEach((content) => {
      wordsCount += content.heading.split(' ').length;
      content.body.forEach((body) => {
        wordsCount += body.text.split(' ').length;
      });
    })

    return (wordsCount / 200).toFixed(0);
  };

  if (router.isFallback) {
    return (
      <div className={styles.loading}>
        <h1>Carregando...</h1>
      </div>
    )
  }

  return (
    <>
    <header className={styles.headerContent}>
      <img src={post.data.banner.url} alt="banner" />
    </header>
    <main className={styles.mainContent}>
      <header>
        <h1>{post.data.title}</h1>
        <div>
          <span><FiCalendar/>{dateFormat(post.first_publication_date)}</span>
          <span><FiUser/>{post.data.author}</span>
          <span><FiClock/>{getTimeReading()} min</span>
        </div>
      </header>
      {
        post.data.content.map((content) => {
          return (
            <section key={post.data.title.replace(' ', '-')}>
              <h1>{content.heading}</h1>      
              {content.body.map(body => {
                return (<p>{body.text}</p>)
              })}
            </section>
          )
        })
      }
    </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    pageSize: 3,
  });

  const paths = posts.results.map((post) => ({
    params: { slug: post.uid },
  }))

  return {
      paths,
      fallback: true
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map((content) => {
        return {
          heading: content.heading,
          body: content.body.map((body) => {
            return {text: body.text}
          }),
        }
      })
    },
  };

  return {
    props: { post },
    revalidate: 60 * 30, //30 minutes
  }
};
