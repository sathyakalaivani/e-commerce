// Reusable query builder for filtering, searching, sorting & pagination on Mongoose queries
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    if (this.queryStr.keyword) {
      this.query = this.query.find({
        $text: { $search: this.queryStr.keyword },
      });
    }
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ["keyword", "page", "limit", "sort", "fields"];
    removeFields.forEach((field) => delete queryCopy[field]);

    // price[gte]=100&price[lte]=500 style filtering
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsed = JSON.parse(queryStr);

    this.query = this.query.find(parsed);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate(resPerPage = 12) {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || resPerPage;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
