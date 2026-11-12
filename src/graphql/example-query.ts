/** Pre-filled in Apollo Sandbox so a visitor can press "Run" right away. */
export const EXAMPLE_QUERY = /* GraphQL */ `
  query BusinessCard {
    profile {
      name
      headline
      description
      location
      avatar {
        url
      }
      totalExperience {
        years
        months
      }
      links {
        type
        label
        url
      }
      skills {
        name
        category
      }
      experience {
        company
        position
        period {
          startDate
          endDate
          isCurrent
          duration {
            years
            months
          }
        }
        achievements
        technologies {
          name
        }
      }
      projects {
        name
        description
        url
        repositoryUrl
        technologies {
          name
        }
      }
    }
  }
`;
