export interface CreateProjectDto {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
}
